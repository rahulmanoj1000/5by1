import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxService } from '@fboservices/inventory/tax.service';
import { Tax } from '@shared/entity/inventory/tax';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

const MAX_RATE = 100;
@Component({
  selector: 'app-create-tax',
  templateUrl: './create-tax.component.html',
  styleUrls: [ './create-tax.component.scss' ]
})
export class CreateTaxComponent implements OnInit {

  formHeader = 'Create Taxes';

  loading = false;

  private groupNames: string[] = [];

  groupNameOptions: Observable<string[]>;


  form: FormGroup = new FormGroup({
    _id: new FormControl(null),
    groupName: new FormControl('', [ Validators.required ]),
    name: new FormControl('', [ Validators.required ]),
    rate: new FormControl('', [ Validators.required, Validators.min(0) ]),
    appliedTo: new FormControl('100', [ Validators.required, Validators.min(0), Validators.max(MAX_RATE) ]),
    description: new FormControl(''),
  });

  constructor(private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly taxService:TaxService,
    private readonly toastr: ToastrService) { }

  private _filter(value: string): string[] {

    const filterValue = value.toLowerCase();
    return this.groupNames.filter((option) => option.toLowerCase().includes(filterValue));

  }

  ngOnInit(): void {

    this.groupNameOptions = this.form.controls.groupName.valueChanges.pipe(
      startWith(''), map((value) => this._filter(value))
    );
    this.taxService.getGroupNames().subscribe((groupNames) => {

      this.groupNames = groupNames;

    });

    const tId = this.route.snapshot.queryParamMap.get('id');
    if (tId) {

      this.formHeader = 'Update Taxes';
      this.loading = true;
      this.taxService.get(tId).subscribe((taxC) => {

        this.form.setValue({_id: taxC._id,
          groupName: taxC.groupName,
          name: taxC.name,
          rate: taxC.rate,
          appliedTo: taxC.appliedTo,
          description: taxC.description});

        this.loading = false;

      });

    }

  }

  goToTaxes(): void {

    const burl = this.route.snapshot.queryParamMap.get('burl');
    const uParams:Record<string, string> = {};
    if (burl?.includes('?')) {

      const httpParams = new HttpParams({ fromString: burl.split('?')[1] });
      const keys = httpParams.keys();
      keys.forEach((key) => (uParams[key] = httpParams.get(key)));

    }
    this.router.navigate([ '/tax' ], {queryParams: uParams});

  }

  upsertTax(): void {

    this.loading = true;
    const taxP = <Tax> this.form.value;
    (taxP._id ? this.taxService.update(taxP) : this.taxService.save(taxP)).subscribe((taxC) => {

      this.toastr.success('Tax saved', `Tax ${taxC.name} is saved successfully`);
      this.goToTaxes();

    }, (error) => {

      this.loading = false;
      this.toastr.error('Tax not saved', `Error in saving tax ${taxP.name}`);
      console.error(error);

    });

  }

}
