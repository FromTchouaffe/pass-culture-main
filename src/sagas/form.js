import get from 'lodash.get'
import {
  capitalize,
  assignErrors,
  mergeForm
} from 'pass-culture-shared'
import { call, put, takeEvery } from 'redux-saga/effects'

const SIRET = 'siret'
const SIREN = 'siren'

const fromWatchSirenInput = sireType => function*(action) {
  const {
    name,
    patch
  } = action

  try {
    const response = yield call(fetch, `https://sirene.entreprise.api.gouv.fr/v1/${sireType}/${patch[sireType]}`)
    if (response.status === 404)  {
      yield put(assignErrors({[sireType]: [`${capitalize(sireType)} invalide`]}))
      yield put(mergeForm(name,
        {
          address: null,
          city: null,
          latitude: null,
          longitude: null,
          name: null,
          postalCode: null,
          [sireType]: null
        }
      ))
    } else {
      const body = yield call([response, 'json'])
      const dataPath = sireType === SIREN ? 'siege_social' : 'etablissement'
      yield put(mergeForm(action.name, {
        address: get(body, `${dataPath}.l4_normalisee`),
        // geo_adresse has postal code and city name which don't belong to this field
        // address: get(body, `${dataPath}.geo_adresse`),
        city: get(body, `${dataPath}.libelle_commune`),
        latitude: parseFloat(get(body, `${dataPath}.latitude`)) || null,
        longitude: parseFloat(get(body, `${dataPath}.longitude`)) || null,
        name: get(body, `${dataPath}.l1_normalisee`) ||  get(body, `${dataPath}.l1_declaree`) || '',
        postalCode: get(body, `${dataPath}.code_postal`),
        [sireType]: get(body, `${dataPath}.${sireType}`),
      }, {
        calledFromSaga: true, // Prevent infinite loop
      }))
    }
  } catch(e) {
    console.error(e)
    yield put(assignErrors({[sireType]: [`Impossible de vérifier le ${capitalize(sireType)} saisi.`]}))
  }
}

export function* watchFormActions() {
  yield takeEvery(
    ({ type, config, patch }) =>
      type === 'MERGE_FORM' && !get(config, 'calledFromSaga') && get(patch, `${SIREN}.length`) === 9,
    fromWatchSirenInput(SIREN)
  )
  yield takeEvery(
    ({ type, config, patch }) =>
      type === 'MERGE_FORM' && !get(config, 'calledFromSaga') && get(patch, `${SIRET}.length`) === 14,
    fromWatchSirenInput(SIRET)
  )
}
