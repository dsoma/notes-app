
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.notes.id
  tags = {
    Name = "${var.project_name}-InternetGateway"
  }
}

resource "aws_eip" "gw" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.igw]
  tags = {
    Name = "${var.project_name}-ElasticIP"
  }
}

resource "aws_nat_gateway" "ngw" {
  subnet_id     = aws_subnet.public1.id
  allocation_id = aws_eip.gw.id
  tags = {
    Name = "${var.project_name}-NATGateway"
  }
}