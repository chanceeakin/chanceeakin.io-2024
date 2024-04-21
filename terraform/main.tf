terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.23.1"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.1"
    }
  }

  required_version = "~> 1.2"
  backend "s3" {
    bucket = "tfstate-blog-6f513405-d501-4ea7-ab75-af86f85c8c48"
    key    = "my_lambda/terraform.tfstate"
    region = "us-east-2"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      aws-rust-example = "rust-lambda-api-gateway"
    }
  }
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "tfstate-blog-6f513405-d501-4ea7-ab75-af86f85c8c48"
  tags = {
    name : "tfstate-blog-s3bucket"
  }

  # Prevent accidental deletion of this S3 bucket
  lifecycle {
    prevent_destroy = true
  }
}
