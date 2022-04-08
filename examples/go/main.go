package main

import (
	"fmt"

	webapp "github.com/jaxxstorm/pulumi-aws-fargatewebapp/sdk/go/fargatewebapp"
	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws/ecs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {

		cluster, err := ecs.NewCluster(ctx, "example", &ecs.ClusterArgs{})
		if err != nil {
			return fmt.Errorf("error creating cluster: %s", err)
		}

		vpc := ec2.LookupVpcOutput(ctx, ec2.LookupVpcOutputArgs{
			Default: pulumi.Bool(true),
		})

		subnets := ec2.GetSubnetsOutput(ctx, ec2.GetSubnetsOutputArgs{
			Filters: ec2.GetSubnetsFilterArray{
				ec2.GetSubnetsFilterArgs{
					Name: pulumi.String("vpc-id"),
					Values: pulumi.StringArray{
						vpc.Id(),
					},
				},
			},
		})

		app, err := webapp.NewDeployment(ctx, "example", &webapp.DeploymentArgs{
			ContainerImage: pulumi.String("nginx"),
			ContainerName:  pulumi.String("nginx"),
			ClusterArn:     cluster.Arn,
			SubnetIds:      subnets.Ids(),
			VpcId:          vpc.Id(),
		})

		if err != nil {
			return fmt.Errorf("error creating webapp deployment: %s", err)
		}

		ctx.Export("url", app.Url)

		return nil
	})
}
