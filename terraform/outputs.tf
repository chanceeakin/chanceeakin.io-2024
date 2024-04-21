output "base_url" {
  description = "Base URL for API Gateway stage."

  value = aws_apigatewayv2_stage.weather_gateway.invoke_url
}

output "lambda_bucket_name" {
  description = "Name of the S3 bucket used to store function code."

  value = aws_s3_bucket.lambda_bucket.id
}
