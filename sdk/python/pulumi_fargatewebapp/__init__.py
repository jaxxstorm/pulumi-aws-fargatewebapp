# coding=utf-8
# *** WARNING: this file was generated by Pulumi SDK Generator. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

from . import _utilities
import typing
# Export this package's modules as members:
from .deployment import *
from .provider import *
_utilities.register(
    resource_modules="""
[
 {
  "pkg": "fargatewebapp",
  "mod": "index",
  "fqn": "pulumi_fargatewebapp",
  "classes": {
   "fargatewebapp:index:Deployment": "Deployment"
  }
 }
]
""",
    resource_packages="""
[
 {
  "pkg": "fargatewebapp",
  "token": "pulumi:providers:fargatewebapp",
  "fqn": "pulumi_fargatewebapp",
  "class": "Provider"
 }
]
"""
)