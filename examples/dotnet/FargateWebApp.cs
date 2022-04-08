using Pulumi;
using Ecs = Pulumi.Aws.Ecs;
using Ec2 = Pulumi.Aws.Ec2;
using WebApp = Pulumi.Fargatewebapp;


class FargateWebApp : Stack
{
    public FargateWebApp()
    {
        var cluster = new Ecs.Cluster("example", new Ecs.ClusterArgs{});

        var vpcId = Ec2.GetVpc.Invoke(new Ec2.GetVpcInvokeArgs {Default = true})
            .Apply(vpc => vpc.Id);
        
        var subnetIds = Ec2.GetSubnetIds.Invoke(new Ec2.GetSubnetIdsInvokeArgs {VpcId = vpcId})
            .Apply(s => s.Ids);

        var webapp = new WebApp.Deployment("example", new WebApp.DeploymentArgs{
            ContainerImage = "nginx",
            ContainerName = "nginx",
            VpcId = vpcId,
            SubnetIds = subnetIds,
            ClusterArn = cluster.Arn,
        });

        this.Url = webapp.Url;

    }

    [Output]
    public Output<string> Url { get; set; }
}
