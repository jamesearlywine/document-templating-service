import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { InstanceProps, SecurityGroupProps } from "aws-cdk-lib/aws-ec2";

export class GotenbergServiceInstance extends Construct {
  registerResources: boolean = true;
  serviceSecurityGroup: cdk.aws_ec2.SecurityGroup;
  serviceSecurityGroupHttpIngress: cdk.aws_ec2.CfnSecurityGroupIngress;
  serviceSecurityGroupSshIngress: cdk.aws_ec2.CfnSecurityGroupIngress;
  gotenbergServiceEc2Instance: cdk.aws_ec2.Instance;
  gotenbergServiceInstanceBaseUrl: cdk.aws_ssm.StringParameter;
  gotenbergBaseUrl: string;

  constructor(
    parentScope,
    name,
    props: {
      AWS_ENV: string;
      vpc: cdk.aws_ec2.IVpc;
      subnet: cdk.aws_ec2.ISubnet;
      enableSshCondition?: cdk.CfnCondition;
      registerResources?: boolean;
    },
  ) {
    super(parentScope, name);
    this.registerResources = props.registerResources ?? this.registerResources;

    /*********************
     * Gotenberg Service
     */
    this.serviceSecurityGroup = new cdk.aws_ec2.SecurityGroup(
      parentScope,
      "serviceSecurityGroup",
      {
        vpc: props.vpc,
      } as SecurityGroupProps,
    );
    this.serviceSecurityGroupHttpIngress =
      new cdk.aws_ec2.CfnSecurityGroupIngress(
        parentScope,
        "serviceSecurityGroupHttpIngress",
        {
          cidrIp: "0.0.0.0/0", // this security group is applied to an EC2 in a private subnet
          ipProtocol: "tcp",
          toPort: 3000,
          fromPort: 3000,
          groupId: this.serviceSecurityGroup.securityGroupId,
        },
      );

    // disabled by default, can be enabled conditionally
    if (props.enableSshCondition) {
      this.serviceSecurityGroupSshIngress =
        new cdk.aws_ec2.CfnSecurityGroupIngress(
          parentScope,
          "serviceSecurityGroupSshIngress",
          {
            cidrIp: "0.0.0.0/0", // temporary to allow SSH access from bastion host in public subnet
            ipProtocol: "tcp",
            toPort: 22,
            fromPort: 22,
            groupId: this.serviceSecurityGroup.securityGroupId,
          },
        );

      this.serviceSecurityGroupSshIngress.cfnOptions.condition =
        props.enableSshCondition;
    }

    const userData = cdk.aws_ec2.UserData.forLinux();
    userData.addCommands(
      "service docker start",
      "usermod -a -G docker ec2-user",
      "chkconfig docker on",
      "docker container run --name gotenbergInstance -p 3000:3000 gotenberg/gotenberg:7.4.2",
      "docker start gotenbergInstance",
    );
    this.gotenbergServiceEc2Instance = new cdk.aws_ec2.Instance(
      parentScope,
      "GotenbergServiceEc2Instance",
      {
        instanceType: cdk.aws_ec2.InstanceType.of(
          cdk.aws_ec2.InstanceClass.C6GD,
          cdk.aws_ec2.InstanceSize.LARGE,
        ),
        machineImage: cdk.aws_ec2.MachineImage.fromSsmParameter(
          "/us-east-2/processproof-gotenberg-ami",
          {
            userData: userData,
          },
        ),
        vpc: props.vpc,
        vpcSubnets: {
          subnets: [props.subnet],
        },
        securityGroup: this.serviceSecurityGroup,
        keyName: "TempKeypair",
        userData,
        userDataCausesReplacement: true,
        associatePublicIpAddress: false,
      } as InstanceProps,
    );

    this.gotenbergBaseUrl = cdk.Fn.sub("http://${GOTENBERG_IP}:3000", {
      GOTENBERG_IP: this.gotenbergServiceEc2Instance.instancePrivateIp,
    });

    if (this.registerResources) {
      this.gotenbergServiceInstanceBaseUrl = new cdk.aws_ssm.StringParameter(
        parentScope,
        "GotenbergServiceInstanceBaseUrl",
        {
          parameterName: cdk.Fn.sub(
            "/${AWS_ENV}/document-templating-service/gotenberg-base-url",
            {
              AWS_ENV: props.AWS_ENV,
            },
          ),
          stringValue: this.gotenbergBaseUrl,
          simpleName: false,
        },
      );
    }
  }
}
