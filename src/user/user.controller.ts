import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
// import { CreatePipelineDto } from './dto/create-pipeline.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.userId);
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Post('pipeline')
  // createPipeline(@Req() req, @Body() createPipelineDto: CreatePipelineDto) {
  //   return this.userService.createPipeline(req.user.userId, createPipelineDto);
  // }

  // @UseGuards(AuthGuard('jwt'))
  // @Get('pipelines')
  // getUserPipelines(@Req() req) {
  //   return this.userService.getUserPipelines(req.user.userId);
  // }

  // @UseGuards(AuthGuard('jwt'))
  // @Delete('pipeline/:id')
  // deletePipeline(@Req() req, @Param('id') id: string) {
  //   return this.userService.deletePipeline(req.user.userId, +id);
  // }

  // @UseGuards(AuthGuard('jwt'))
  // @Patch('pipeline/:id')
  // updatePipeline(
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() updatePipelineDto: CreatePipelineDto,
  // ) {
  //   return this.userService.updatePipeline(req.user.userId, +id, updatePipelineDto);
  // }
}