import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { RiskCalculatorService } from './risk/risk-calculator.service';
import { StatusTransitionValidator } from './status/status-transition.validator';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectsRepository,
    RiskCalculatorService,
    StatusTransitionValidator,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
