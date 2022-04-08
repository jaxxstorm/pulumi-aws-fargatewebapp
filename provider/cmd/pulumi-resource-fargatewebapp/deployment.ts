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
  subnetIds: pulumi.Input<pulumi.Input<string>[]>;
  containerName: string;
  containerImage: string;
  clusterArn: pulumi.Input<string>;
}

export class Deployment extends pulumi.ComponentResource {
  public readonly url: pulumi.Output<string>;
  constructor(
    name: string,
    args: DeploymentArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("fargatewebapp:index:Deployment", name, args, opts);

    const securityGroup = new aws.ec2.SecurityGroup(name, {
      vpcId: args.vpcId,
      description: "HTTP access",
      ingress: [
        {
          protocol: "tcp",
          fromPort: 80,
          toPort: 80,
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
    });

    // define a loadbalancer
    const lb = new aws.lb.LoadBalancer(name, {
      securityGroups: [securityGroup.id],
      subnets: args.subnetIds,
    });

    // target group for port 80
    const targetGroupA = new aws.lb.TargetGroup(name, {
      port: 80,
      protocol: "HTTP",
      targetType: "ip",
      vpcId: args.vpcId,
    });

    // listener for port 80
    const listener = new aws.lb.Listener(name, {
      loadBalancerArn: lb.arn,
      port: 80,
      defaultActions: [
        {
          type: "forward",
          targetGroupArn: targetGroupA.arn,
        },
      ],
    });

    const role = new aws.iam.Role(name, {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "ecs-tasks.amazonaws.com",
      }),
    });

    new aws.iam.RolePolicyAttachment(name, {
      role: role.name,
      policyArn:
        "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });

    const taskDefinition = new aws.ecs.TaskDefinition(name, {
      family: name,
      cpu: "256",
      memory: "512",
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      executionRoleArn: role.arn,
      containerDefinitions: JSON.stringify([
        {
          name: args.containerName,
          image: args.containerImage,
          portMappings: [
            {
              containerPort: 80,
              hostPort: 80,
              protocol: "tcp",
            },
          ],
        },
      ]),
    });

    const svcA = new aws.ecs.Service(name, {
      cluster: args.clusterArn,
      desiredCount: 1,
      launchType: "FARGATE",
      taskDefinition: taskDefinition.arn,
      networkConfiguration: {
        assignPublicIp: true,
        subnets: args.subnetIds,
        securityGroups: [securityGroup.id],
      },
      loadBalancers: [
        {
          targetGroupArn: targetGroupA.arn,
          containerName: args.containerName,
          containerPort: 80,
        },
      ],
    });

    this.url = lb.dnsName;

    this.registerOutputs({
        "url": this.url
    });
  }
}
