import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LedgerReportComponent } from './ledger/ledger-report/ledger-report.component';
import { LedgerGroupReportComponent } from './ledger-group/ledger-group-report/ledger-group-report.component';
import { TrialBalanceReportComponent } from './trial-balance/trial-balance-report/trial-balance-report.component';
import { ProfitLossReportComponent } from './profit-loss/profit-loss-report/profit-loss-report.component';

const routes: Routes = [
  {
    path: 'ledger',
    pathMatch: 'full',
    component: LedgerReportComponent
  },
  {
    path: 'ledger-group',
    pathMatch: 'full',
    component: LedgerGroupReportComponent
  },
  {
    path: 'trial-balance',
    pathMatch: 'full',
    component: TrialBalanceReportComponent
  },
  {
    path: 'profit-loss',
    pathMatch: 'full',
    component: ProfitLossReportComponent
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class ReportsRoutingModule { }
