'use strict'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/do'
import * as lf from 'lovefield'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observer } from 'rxjs/Observer'

export interface LfFactoryInit {
  storeType: lf.schema.DataStoreType
  enableInspector: boolean
}

export const schemaBuilder = lf.schema.create('teambition', 1)

export interface lfFactoryResult {
  db: lf.Database
  schemaBuilder: lf.schema.Builder
}

export const rawDb$ = new ReplaySubject<lf.raw.BackStore>(1)

function onUpgrade (rawDb: lf.raw.BackStore) {
  rawDb$.next(rawDb)
  rawDb$.complete()
  return Promise.resolve()
}

export const lfFactory = (config: LfFactoryInit): Observable<lf.Database> => {
  return Observable.create((observer: Observer<lf.Database>) => {
    (<any>config).onUpgrade = onUpgrade
    schemaBuilder.connect(<any>config)
      .then(db => {
        observer.next(db)
        observer.complete()
      })
      .catch(e => observer.error(e))
  })
    .publishReplay(1)
    .refCount()
}
