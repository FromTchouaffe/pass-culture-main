import classnames from 'classnames'
import get from 'lodash.get'
import {
  CancelButton,
  closeNotification,
  Icon,
  Field,
  Form,
  requestData,
  showNotification,
  SubmitButton,
  withLogin,
} from 'pass-culture-shared'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import { compose } from 'redux'

import HeroSection from '../layout/HeroSection'
import Main from '../layout/Main'
import VenueProvidersManager from '../managers/VenueProvidersManager'
import offererSelector from '../../selectors/offerer'
import selectVenuePatchByVenueIdByOffererId from '../../selectors/selectVenuePatchByVenueIdByOffererId'
import { offererNormalizer, venueNormalizer } from '../../utils/normalizers'

class VenuePage extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: false,
      isNew: false,
      isReadOnly: true,
    }
  }

  static getDerivedStateFromProps(nextProps) {
    const {
      location: { search },
      match: {
        params: { venueId },
      },
    } = nextProps
    const isEdit = search.includes('modifie')
    const isNew = venueId === 'nouveau'
    const isReadOnly = !isNew && !isEdit
    return {
      isNew,
      isReadOnly,
    }
  }

  handleDataRequest = (handleSuccess, handleFail) => {
    const {
      dispatch,
      match: {
        params: { offererId, venueId },
      },
      venuePatch,
    } = this.props
    if (!venuePatch && venueId !== 'nouveau') {
      dispatch(
        requestData('GET', `offerers/${offererId}`, {
          handleSuccess: () => {
            requestData('GET', `venues/${venueId}`, {
              handleSuccess,
              handleFail,
              key: 'venues',
              normalizer: venueNormalizer,
            })
          },
          handleFail,
          key: 'offerers',
          normalizer: offererNormalizer,
        })
      )
    } else {
      return handleSuccess()
    }
  }

  handleSuccess = (state, action) => {
    const { dispatch, history, offerer } = this.props
    const venueId = get(action, 'data.id')
    if (!venueId) {
      console.warn('You should have a venueId here')
      return
    }

    // const redirectPathname = `/structures/${offerer.id}`
    const redirectPathname =
      get(action, 'method') === 'POST'
        ? `/structures/${get(offerer, 'id')}/lieux/${venueId}`
        : `/structures/${get(offerer, 'id')}`
    history.push(redirectPathname)

    const createOfferPathname = `/offres/nouveau?lieu=${venueId}`

    const text =
      get(action, 'method') === 'POST' ? (
        <p>
          Lieu créé. Vous pouvez maintenant y{' '}
          <NavLink
            to={createOfferPathname}
            onClick={() => dispatch(closeNotification())}>
            créer une offre
          </NavLink>
          , ou en importer automatiquement.
        </p>
      ) : (
        'Lieu modifié avec succès !'
      )

    dispatch(
      showNotification({
        text,
        type: 'success',
      })
    )
    // TODO: do it in the way that the notification
    // is displayed in the next page an disapeear when
    // the user is after changing to another page
  }

  render() {
    const {
      formLatitude,
      formLongitude,
      match: {
        params: { offererId, venueId },
      },
      name,
      offerer,
      sire,
      venuePatch,
    } = this.props
    const { isNew, isReadOnly } = this.state

    const isSiretSkipping = name && !sire

    return (
      <Main
        backTo={{
          label:
            get(offerer, 'name') === get(venuePatch, 'name')
              ? 'STRUCTURE'
              : get(offerer, 'name'),
          path: `/structures/${offererId}`,
        }}
        name="venue"
        handleDataRequest={this.handleDataRequest}>
        <HeroSection subtitle={get(venuePatch, 'name')} title="Lieu">
          {isNew && (
            <p className="subtitle">Ajoutez un lieu où accéder à vos offres.</p>
          )}

          {get(offerer, 'id') &&
            get(venuePatch, 'id') && (
              <NavLink
                to={`/offres/nouveau?lieu=${venuePatch.id}`}
                className="cta button is-primary">
                <span className="icon">
                  <Icon svg="ico-offres-w" />
                </span>
                <span>Créer une offre</span>
              </NavLink>
            )}
        </HeroSection>

        {!isNew && <VenueProvidersManager venue={venuePatch} />}

        {!get(venuePatch, 'isVirtual') && (
          <Form
            action={`/venues/${get(venuePatch, 'id', '')}`}
            handleSuccess={this.handleSuccess}
            name="venue"
            patch={venuePatch}
            readOnly={isReadOnly}>
            <Field type="hidden" name="managingOffererId" />
            <div className="section">
              <h2 className="main-list-title">
                IDENTIFIANTS
                <span className="is-pulled-right is-size-7 has-text-grey">
                  Les champs marqués d'un{' '}
                  <span className="required-legend"> * </span> sont obligatoires
                </span>
              </h2>
              <div className="field-group">
                <Field
                  className={classnames({ 'is-invisible': isSiretSkipping })}
                  label="SIRET (si applicable)"
                  name="siret"
                  renderInfo={() => (
                    <span data-tip="hello world" className="button">
                      <Icon svg="picto-info" />
                    </span>
                  )}
                  type="siret"
                />

                <Field
                  isExpanded
                  label="Nom"
                  name="name"
                  readOnly={sire}
                  required
                />
                <Field
                  label="E-mail"
                  name="bookingEmail"
                  required
                  type="email"
                />
              </div>
            </div>
            <div className="section">
              <h2 className="main-list-title">ADRESSE</h2>
              <div className="field-group">
                <Field
                  isExpanded
                  label="Numéro et voie"
                  latitude={formLatitude}
                  longitude={formLongitude}
                  name="address"
                  readOnly={sire}
                  required
                  type="geo"
                  withMap
                />
                <Field
                  autocomplete="postal-code"
                  label="Code postal"
                  name="postalCode"
                  readOnly={sire}
                  required
                />
                <Field
                  autocomplete="address-level2"
                  label="Ville"
                  name="city"
                  readOnly={sire}
                  required
                />
                <Field label="Latitude" name="latitude" required />
                <Field label="Longitude" name="longitude" required />
              </div>
            </div>
            <hr />
            <div
              className="field is-grouped is-grouped-centered"
              style={{ justifyContent: 'space-between' }}>
              <div className="control">
                {isReadOnly ? (
                  <NavLink
                    className="button is-secondary is-medium"
                    to={`/structures/${offererId}/lieux/${venueId}?modifie`}>
                    Modifier le lieu
                  </NavLink>
                ) : (
                  <CancelButton
                    className="button is-secondary is-medium"
                    to={
                      isNew
                        ? `/structures/${offererId}`
                        : `/structures/${offererId}/lieux/${venueId}`
                    }>
                    Annuler
                  </CancelButton>
                )}
              </div>
              {venueId && (
                <div className="control">
                  <div
                    className="field is-grouped is-grouped-centered"
                    style={{ justifyContent: 'space-between' }}>
                    <div className="control">
                      <NavLink
                        className="button is-secondary is-medium"
                        to={`/offres/nouveau?lieu=${venueId}`}>
                        Créer une offre dans ce lieu
                      </NavLink>
                    </div>
                  </div>
                </div>
              )}
              <div className="control">
                <div
                  className="field is-grouped is-grouped-centered"
                  style={{ justifyContent: 'space-between' }}>
                  <div className="control">
                    {isReadOnly ? (
                      <NavLink
                        className="button is-primary is-medium"
                        to={`/structures/${offererId}`}>
                        Terminer
                      </NavLink>
                    ) : (
                      <SubmitButton className="button is-primary is-medium">
                        {isNew ? 'Créer' : 'Valider'}
                      </SubmitButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Main>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { offererId, venueId } = ownProps.match.params
  return {
    formLatitude: get(state, 'form.venue.latitude'),
    formLongitude: get(state, 'form.venue.longitude'),
    name: get(state, `form.venue.name`),
    offerer: offererSelector(state, offererId),
    sire: get(state, `form.venue.sire`),
    user: state.user,
    venuePatch: selectVenuePatchByVenueIdByOffererId(state, venueId, offererId),
  }
}

export default compose(
  withLogin({ failRedirect: '/connexion' }),
  withRouter,
  connect(mapStateToProps)
)(VenuePage)
