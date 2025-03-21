
variable "aws_region" { default = "us-west-2" }

variable "project_name" { default = "notes-app" }
variable "vpc_name" { default = "notes-vpc" }

variable "vpc_cidr" { default = "10.0.0.0/16" }
variable "public1_cidr" { default = "10.0.1.0/24" }
variable "private1_cidr" { default = "10.0.3.0/24" }

variable "enable_dns_support" { default = true }
variable "enable_dns_hostnames" { default = true }

variable "ami_id" { default = "ami-00c257e12d6828491" }
variable "instance_type" { default = "t2.micro" }
variable "key_pair" { default = "notes-app-0305" }
