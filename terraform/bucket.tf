resource "random_pet" "lambda_bucket_name" {
  prefix = "rust-lambda"
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = random_pet.lambda_bucket_name.id
}

resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

data "archive_file" "rust_weather_api" {
  type = "zip"

  source_dir  = "${path.module}/../lambdas/rust_weather_api/target/lambda/rust_weather_api"
  output_path = "${path.module}/bootstrap.zip"
}

resource "aws_s3_object" "rust_weather_api" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "bootstrap.zip"
  source = data.archive_file.rust_weather_api.output_path

  etag = filemd5(data.archive_file.rust_weather_api.output_path)
}
