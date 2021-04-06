import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class PostDTO {
  @IsString()
  @MinLength(8)
  title: string;

  @IsString()
  @MinLength(10)
  body: string;
}

export class AssignmentDTO {
  @IsString()
  @MinLength(8)
  title: string;

  @IsString()
  @MinLength(10)
  body: string;

  @IsOptional()
  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  totalPoints: number;
}

export class CommentDTO {
  @IsString()
  @MinLength(10)
  body: string;
}

export class GradeDTO {
  @IsNumber()
  @Min(0)
  points: number;

  @IsOptional()
  @IsString()
  comments: string;
}
