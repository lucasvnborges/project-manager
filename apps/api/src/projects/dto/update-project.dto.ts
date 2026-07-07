import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

/**
 * Reaproveita as validacoes de CreateProjectDto tornando todos os campos
 * opcionais. Nao inclui "status": a mudanca de status tem um endpoint e
 * DTO dedicados (ChangeProjectStatusDto), pois segue uma maquina de
 * estados propria em vez de uma simples atualizacao de campo.
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
