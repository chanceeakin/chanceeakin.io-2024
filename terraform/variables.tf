variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "api_gateway_name" {
  type    = string
  default = "Weather API Gateway"
}

variable "api_gateway_description" {
  type    = string
  default = "API Gateway for the weather."
}

variable "api_gateway_usage_plan_name" {
  type    = string
  default = "WeatherGatewayPlan"
}

variable "api_gatway_api_key_name" {
  type    = string
  default = "weather_api_key"
}
