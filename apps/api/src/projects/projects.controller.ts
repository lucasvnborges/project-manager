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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectAiAnalysis } from '@repo/shared-types';
import { AiAnalysisService } from '../ai-analysis/ai-analysis.service';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um projeto (status inicial sempre Em análise)',
  })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  async create(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.create(createProjectDto);
    return ProjectResponseDto.fromDomain(project);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsService.findAll();
    return projects.map((project) => ProjectResponseDto.fromDomain(project));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto por id' })
  @ApiParam({ name: 'id', example: '9b0a3655-3845-4f72-8514-c560c926edee' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsService.findById(id);
    return ProjectResponseDto.fromDomain(project);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza dados do projeto (recalcula o risco quando necessário)',
  })
  @ApiParam({ name: 'id', example: '9b0a3655-3845-4f72-8514-c560c926edee' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Edição bloqueada pelo status atual do projeto',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsService.update(id, updateProjectDto);
    return ProjectResponseDto.fromDomain(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um projeto (bloqueado para em andamento/encerrado)',
  })
  @ApiParam({ name: 'id', example: '9b0a3655-3845-4f72-8514-c560c926edee' })
  @ApiResponse({ status: 204, description: 'Projeto removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Exclusão bloqueada pelo status atual do projeto',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Altera o status do projeto respeitando a máquina de estados',
  })
  @ApiParam({ name: 'id', example: '9b0a3655-3845-4f72-8514-c560c926edee' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Transição de status não permitida',
  })
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
  @ApiOperation({
    summary:
      'Gera uma análise textual do projeto com apoio de IA (resumo, pontos de atenção e recomendação executiva)',
  })
  @ApiParam({ name: 'id', example: '9b0a3655-3845-4f72-8514-c560c926edee' })
  @ApiResponse({ status: 200, description: 'Análise gerada com sucesso' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async getAiAnalysis(@Param('id') id: string): Promise<ProjectAiAnalysis> {
    const project = await this.projectsService.findById(id);
    return this.aiAnalysisService.analyze(project);
  }
}
