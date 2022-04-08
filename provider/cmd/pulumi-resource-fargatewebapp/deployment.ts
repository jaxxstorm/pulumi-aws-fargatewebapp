// Copyright 2016-2021, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface DeploymentArgs {
  vpcId: pulumi.Input<string>;
  httpPort?: pulumi.Input<number>;
  subnetIds: pulumi.Input<pulumi.Input<string>[]>;
  containerImage: pulumi.Input<string>;
  containerName: pulumi.Input<string>;
  containerPort?: pulumi.Input<number>;
  clusterArn: pulumi.Input<string>;
}

export class Deployment extends pulumi.ComponentResource {
  public readonly role: aws.iam.Role;
  public readonly securityGroup: aws.ec2.SecurityGroup;
  public readonly lb: aws.lb.LoadBalancer;
  public readonly targetGroup: aws.lb.TargetGroup;
  public readonly listener: aws.lb.Listener;
  public readonly taskDefinition: aws.ecs.TaskDefinition;
  public readonly service: aws.ecs.Service;
  public readonly url: pulumi.Output<string>;
  constructor(
    name: string,
    args: DeploymentArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("fargatewebapp:index:Deployment", name, args, opts);

    this.securityGroup = new aws.ec2.SecurityGroup(
      name,
      {
        vpcId: args.vpcId,
        description: "HTTP access",
        ingress: [
          {
            protocol: "tcp",
            fromPort: args.httpPort || 80,
            toPort: args.httpPort || 80,
            cidrBlocks: ["0.0.0.0/0"],
          },
        ],
        egress: [
          {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
          },
        ],
      },
      { parent: this }
    );

    // define a loadbalancer
    this.lb = new aws.lb.LoadBalancer(
      name,
      {
        securityGroups: [this.securityGroup.id],
        subnets: args.subnetIds,
      },
      { parent: this }
    );

    // target group for port 80
    this.targetGroup = new aws.lb.TargetGroup(
      name,
      {
        port: args.httpPort,
        protocol: "HTTP",
        targetType: "ip",
        vpcId: args.vpcId,
      },
      { parent: this }
    );

    this.listener = new aws.lb.Listener(
      name,
      {
        loadBalancerArn: this.lb.arn,
        port: args.httpPort || 80,
        defaultActions: [
          {
            type: "forward",
            targetGroupArn: this.targetGroup.arn,
          },
        ],
      },
      { parent: this.lb }
    );

    this.role = new aws.iam.Role(
      name,
      {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
          Service: "ecs-tasks.amazonaws.com",
        }),
      },
      { parent: this }
    );

    new aws.iam.RolePolicyAttachment(
      name,
      {
        role: this.role.name,
        policyArn:
          "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
      },
      { parent: this.role }
    );

    this.taskDefinition = new aws.ecs.TaskDefinition(
      name,
      {
        family: name,
        cpu: "256",
        memory: "512",
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        executionRoleArn: this.role.arn,
        containerDefinitions: pulumi
          .all([
            args.containerImage,
            args.containerName,
            args.httpPort,
            args.containerPort,
          ])
          .apply(([image, name, httpPort, containerPort]) =>
            JSON.stringify([
              {
                name: name,
                image: image,
                portMappings: [
                  {
                    containerPort: containerPort || 80,
                    hostPort: httpPort || 80,
                    protocol: "tcp",
                  },
                ],
              },
            ])
          ),
      },
      { parent: this }
    );

    this.service = new aws.ecs.Service(
      name,
      {
        cluster: args.clusterArn,
        desiredCount: 1,
        launchType: "FARGATE",
        taskDefinition: this.taskDefinition.arn,
        networkConfiguration: {
          assignPublicIp: true,
          subnets: args.subnetIds,
          securityGroups: [this.securityGroup.id],
        },
        loadBalancers: [
          {
            targetGroupArn: this.targetGroup.arn,
            containerName: args.containerName,
            containerPort: args.containerPort || 80,
          },
        ],
      },
      { parent: this.taskDefinition }
    );

    this.url = this.lb.dnsName;

    this.registerOutputs({
      url: this.lb.dnsName,
    });
  }
}
