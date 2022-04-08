"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws
import pulumi_fargatewebapp as webapp

cluster = aws.ecs.Cluster("example")

vpc = aws.ec2.get_vpc_output(default=True)
subnets = aws.ec2.get_subnets_output(filters=[aws.ec2.GetSubnetsFilterArgs(name="vpc-id", values=[vpc.id])])

app = webapp.Deployment(
    "example",
    webapp.DeploymentArgs(
        cluster_arn=cluster.arn, container_image="nginx", container_name="nginx", subnet_ids=subnets.ids, vpc_id=vpc.id
    ),
)

pulumi.export("url", app.url)
