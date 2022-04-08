import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as webapp from "@jaxxstorm/pulumi-fargatewebapp";

const cluster = new aws.ecs.Cluster("example")

const vpc = aws.ec2.getVpcOutput({ default: true });
const subnets = aws.ec2.getSubnetsOutput({
  filters: [
    {
      name: "vpc-id",
      values: [vpc.id],
    },
  ],
});

const app = new webapp.Deployment("example", {
    containerImage: "nginx",
    containerName: "nginx",
    clusterArn: cluster.arn,
    vpcId: vpc.id,
    subnetIds: subnets.ids,
})


