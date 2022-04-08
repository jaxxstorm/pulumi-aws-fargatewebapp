// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

export class Deployment extends pulumi.ComponentResource {
    /** @internal */
    public static readonly __pulumiType = 'fargatewebapp:index:Deployment';

    /**
     * Returns true if the given object is an instance of Deployment.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is Deployment {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === Deployment.__pulumiType;
    }

    /**
     * The website URL.
     */
    public /*out*/ readonly url!: pulumi.Output<string>;

    /**
     * Create a Deployment resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: DeploymentArgs, opts?: pulumi.ComponentResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            if ((!args || args.clusterArn === undefined) && !opts.urn) {
                throw new Error("Missing required property 'clusterArn'");
            }
            if ((!args || args.containerImage === undefined) && !opts.urn) {
                throw new Error("Missing required property 'containerImage'");
            }
            if ((!args || args.containerName === undefined) && !opts.urn) {
                throw new Error("Missing required property 'containerName'");
            }
            if ((!args || args.subnetIds === undefined) && !opts.urn) {
                throw new Error("Missing required property 'subnetIds'");
            }
            if ((!args || args.vpcId === undefined) && !opts.urn) {
                throw new Error("Missing required property 'vpcId'");
            }
            resourceInputs["clusterArn"] = args ? args.clusterArn : undefined;
            resourceInputs["containerImage"] = args ? args.containerImage : undefined;
            resourceInputs["containerName"] = args ? args.containerName : undefined;
            resourceInputs["containerPort"] = args ? args.containerPort : undefined;
            resourceInputs["httpPort"] = args ? args.httpPort : undefined;
            resourceInputs["subnetIds"] = args ? args.subnetIds : undefined;
            resourceInputs["vpcId"] = args ? args.vpcId : undefined;
            resourceInputs["url"] = undefined /*out*/;
        } else {
            resourceInputs["url"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(Deployment.__pulumiType, name, resourceInputs, opts, true /*remote*/);
    }
}

/**
 * The set of arguments for constructing a Deployment resource.
 */
export interface DeploymentArgs {
    /**
     * The ECS cluster ARN
     */
    clusterArn: pulumi.Input<string>;
    /**
     * The container image
     */
    containerImage: pulumi.Input<string>;
    /**
     * The container name
     */
    containerName: pulumi.Input<string>;
    /**
     * The container port
     */
    containerPort?: pulumi.Input<string>;
    /**
     * The http port to listen on
     */
    httpPort?: pulumi.Input<string>;
    /**
     * The subnet Ids to pass
     */
    subnetIds: pulumi.Input<pulumi.Input<string>[]>;
    /**
     * The ID of the VPC
     */
    vpcId: pulumi.Input<string>;
}
