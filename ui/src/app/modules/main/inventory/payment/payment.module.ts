import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePaymentComponent } from './create-payment/create-payment.component';
import { ListPaymentComponent } from './list-payment/list-payment.component';
import { PaymentRoutingModule } from './payment.routing.module';
import { DeletePaymentComponent } from './delete-payment/delete-payment.component';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { ToolBarModule } from '../../tool-bar/tool-bar.module';
import { DataTableModule } from '../../data-table/data-table.module';
import {MatTableModule} from '@angular/material/table';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {MatSortModule} from '@angular/material/sort';

@NgModule({
  declarations: [ CreatePaymentComponent, ListPaymentComponent, DeletePaymentComponent ],
  imports: [
    CommonModule, PaymentRoutingModule, MatSelectModule, MatFormFieldModule, ReactiveFormsModule,
    FormsModule, MatInputModule, MatButtonModule, MatTableModule, MatSortModule,
    NgxSkeletonLoaderModule, ToolBarModule, MatDatepickerModule, MatNativeDateModule,
    DataTableModule,
  ]
})
export class PaymentModule { }
