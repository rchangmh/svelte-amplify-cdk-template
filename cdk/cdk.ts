#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "@aws-cdk/core"
import { MyStack } from "./my.stack"

const app = new cdk.App()
new MyStack(app, "MyStack")
