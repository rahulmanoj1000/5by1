import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ledger } from '@shared/entity/accounting/ledger';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { goToPreviousPage as _goToPreviousPage } from '@fboutil/fbo.util';
import { LedgerService } from '@fboservices/accounting/ledger.service';
import { LedgerGroupService } from '@fboservices/accounting/ledger-group.service';
import { LedgerGroup } from '@shared/entity/accounting/ledger-group';
import { QueryData } from '@shared/util/query-data';
import { TransactionType } from '@shared/entity/accounting/transaction';
import { zip } from 'rxjs';

interface ExtrasInteface {
  extras : {
    [prop: string]: { 'type' : string, 'name' : string };
  }
}

const EXTRA_CONTROL_NAME = 'extras';
@Component({
  selector: 'app-create-ledger',
  templateUrl: './create-ledger.component.html',
  styleUrls: [ './create-ledger.component.scss', '../../../../../util/styles/fbo-form-style.scss' ]
})
export class CreateLedgerComponent implements OnInit {

  assetsLGS = []

  liabilitiesLGS = []

  goToPreviousPage = _goToPreviousPage;

  optionalField = true;

  defaultField = true

  loading = true;

  transType = [ 'Credit', 'Debit' ];

  formHeader = 'Create Ledger';

  ledgerGroupFiltered: Array<LedgerGroup> = [];

  form: FormGroup = new FormGroup({

    id: new FormControl(null),
    name: new FormControl('', [ Validators.required ]),
    code: new FormControl('', [ Validators.required ]),
    ledgerGroup: new FormControl('', [ Validators.required ]),
    obAmount: new FormControl(0, [ Validators.required ]),
    obType: new FormControl('Credit', [ Validators.required ]),
    details: new FormControl(''),

  });

  currentLedger: Ledger;

  constructor(public readonly router: Router,
    public readonly route: ActivatedRoute,
    private readonly ledgerService: LedgerService,
    private readonly toastr: ToastrService,
    private readonly ledgergroupService:LedgerGroupService) { }

  ngOnInit(): void {

    const childsofassets$ = this.ledgergroupService.childs({ code: { inq: [ 'ASTS' ] } });
    const childsofliabilities$ = this.ledgergroupService.childs({ code: { inq: [ 'LBLTS' ] } });

    const assetLiablity = zip(childsofassets$, childsofliabilities$);
    const subs = assetLiablity.subscribe(([ assetsLGS, liabilitiesLGS ]) => {

      this.assetsLGS = assetsLGS;
      this.liabilitiesLGS = liabilitiesLGS;
      this.initValueChanges();

    });


    const tId = this.route.snapshot.queryParamMap.get('id');

    if (tId) {

      this.formHeader = 'Update Ledger';

      const queryParam:QueryData = {
        include: [
          {relation: 'ledgerGroup'}
        ]
      };
      this.ledgerService.get(tId, queryParam).subscribe((ledgerC) => {

        this.currentLedger = ledgerC;
        this.form.setValue({
          id: ledgerC.id ?? '',
          name: ledgerC.name ?? '',
          code: ledgerC.code ?? '',
          ledgerGroup: ledgerC.ledgerGroup ?? '',
          details: ledgerC.details ?? '',
          obAmount: ledgerC.obAmount ?? 0,
          obType: ledgerC.obType ?? TransactionType.CREDIT,
        });

        this.loading = false;

      });

    } else {

      this.loading = false;

    }

  }

  private createExtraFormGroup = (extras:{ [prop: string]: { type: string; name: string; }; }): FormGroup => {

    const formControls:Record<string, FormControl> = {};
    for (const key in extras) {

      if (!extras.hasOwnProperty(key)) {

        continue;

      }
      formControls[key] = new FormControl(this.currentLedger?.extras[key] ?? '');

    }

    return new FormGroup(formControls);

  }

  private initValueChanges = () => {

    this.form.controls.ledgerGroup.valueChanges.subscribe((ledgerQ:unknown) => {

      if (typeof ledgerQ !== 'string') {

        const selectedLdgId = this.form.controls.ledgerGroup.value.id;
        if (this.assetsLGS.find((ldGrp) => selectedLdgId === ldGrp.id)) {

          this.transType = [ 'Debit' ];
          this.form.controls.obType.setValue(TransactionType.DEBIT);
          this.optionalField = true;

        } else if (this.liabilitiesLGS.find((ldGrp) => selectedLdgId === ldGrp.id)) {

          this.transType = [ 'Credit' ];
          this.form.controls.obType.setValue(TransactionType.CREDIT);
          this.optionalField = true;

        } else {

          this.optionalField = false;
          this.form.controls.obAmount.setValue(0);

        }


        const lGroup:LedgerGroup & ExtrasInteface = this.form.controls.ledgerGroup.value;
        if (!lGroup.extras) {


          return;

        }

        if (this.form.contains(EXTRA_CONTROL_NAME)) {

          this.form.removeControl(EXTRA_CONTROL_NAME);

        }
        this.form.addControl(EXTRA_CONTROL_NAME, this.createExtraFormGroup(lGroup.extras));


        return;

      }
      this.ledgergroupService.search({ where: {name: {like: ledgerQ,
        options: 'i'}} })
        .subscribe((ledgerGroups) => (this.ledgerGroupFiltered = ledgerGroups));

    });

  };

  extractNameOfObject = (obj: {name: string}): string => obj.name;

  getFormName = (key: string): string => {

    const lGroup:ExtrasInteface = this.form.controls.ledgerGroup.value;
    const {name} = lGroup.extras[key];
    return name;

  }

  extrasControls = ():Array<string> => {

    const lGroup:ExtrasInteface = this.form.controls.ledgerGroup.value;

    if (!lGroup?.extras) {

      return [];

    }

    const keys:Array<string> = [];
    for (const key in lGroup.extras) {

      if (!lGroup.extras.hasOwnProperty(key)) {

        continue;

      }
      keys.push(key);

    }
    return keys;

  }

  upsertLedger(): void {


    if (!this.form.valid) {

      return;

    }
    this.loading = true;
    const ledgerP = <Ledger> this.form.value;
    this.ledgerService.upsert(ledgerP).subscribe(() => {

      this.toastr.success(`Ledger ${ledgerP.name} is saved successfully`, 'Ledger saved');
      this.goToPreviousPage(this.route, this.router);

    }, (error) => {

      this.loading = false;
      this.toastr.error(`Error in saving Ledger ${ledgerP.name}`, 'Ledger not saved');
      console.error(error);

    });

  }


}
