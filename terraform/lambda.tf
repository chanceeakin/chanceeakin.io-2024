resource "aws_lambda_function" "rust_weather_api" {
  function_name = "rust_weather_api"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.rust_weather_api.key

  handler = "rust.handler"
  runtime = "provided.al2"

  source_code_hash = data.archive_file.rust_weather_api.output_base64sha256

  role = aws_iam_role.lambda_execution_policy.arn
}

resource "aws_cloudwatch_log_group" "rust_weather_api" {
  name = "/aws/lambda/${aws_lambda_function.rust_weather_api.function_name}"

  retention_in_days = 1
}

resource "aws_iam_role" "lambda_execution_policy" {
  name = "rust-weather-api-lambda-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role = aws_iam_role.lambda_execution_policy.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
