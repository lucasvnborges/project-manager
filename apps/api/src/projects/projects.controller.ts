import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectAiAnalysis } from '@repo/shared-types';
import { AiAnalysisService } from '../ai-analysis/ai-analysis.service';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.create(createProjectDto);
    return ProjectResponseDto.fromDomain(project);
  }

  @Get()
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.findAll();
    return projects.map((project) => ProjectResponseDto.fromDomain(project));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsService.findById(id);
    return ProjectResponseDto.fromDomain(project);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.update(id, updateProjectDto);
    return ProjectResponseDto.fromDomain(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeProjectStatusDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.changeStatus(
      id,
      changeStatusDto,
    );
    return ProjectResponseDto.fromDomain(project);
  }

  @Get(':id/ai-analysis')
  async getAiAnalysis(@Param('id') id: string): Promise<ProjectAiAnalysis> {
    const project = await this.projectsService.findById(id);
    return this.aiAnalysisService.analyze(project);
  }
}
