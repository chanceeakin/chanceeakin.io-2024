resource "aws_apigatewayv2_api" "weather_gateway" {
  name = "weather-gateway"

  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "weather_gateway" {
  api_id = aws_apigatewayv2_api.weather_gateway.id

  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.weather_gateway.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "get_weather" {
  api_id = aws_apigatewayv2_api.weather_gateway.id

  integration_uri    = aws_lambda_function.rust_weather_api.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_weather" {
  api_id = aws_apigatewayv2_api.weather_gateway.id

  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.get_weather.id}"
}

resource "aws_cloudwatch_log_group" "weather_gateway" {
  name = "/aws/api-gateway/${aws_apigatewayv2_api.weather_gateway.name}"

  retention_in_days = 1
}

resource "aws_lambda_permission" "weather_gateway" {
  statement_id = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"

  function_name = aws_lambda_function.rust_weather_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.weather_gateway.execution_arn}/*/*"
}
