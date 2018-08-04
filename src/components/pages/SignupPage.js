import { Field, Form, SubmitButton } from 'pass-culture-shared'
import React, { Component } from 'react'
import { Portal } from 'react-portal'
import { NavLink } from 'react-router-dom'

import Main from '../layout/Main'

class SignupPage extends Component {
  constructor() {
    super()
    this.state = { $footer: null }
  }

  componentDidMount() {
    this.setState({ $footer: this.$footer })
  }

  render() {
    return (
      <Main name="sign-up">
        <div className="section">
          <h2 className="subtitle is-italic">
            {"Une minute pour créer un compte, et puis c'est tout !"}
          </h2>

          <br />
          <Form
            name="user"
            action="/users/signup"
            layout="vertical"
            handleSuccessNotification={null}
            handleSuccessRedirect={() => '/decouverte'}
          >
            <Field
              autoComplete="name"
              label="Identifiant"
              name="publicName"
              placeholder="Mon nom ou pseudo"
              required
              sublabel="que verront les autres utilisateurs"
              type="text"
            />
            <Field
              autoComplete="email"
              label="Adresse e-mail"
              name="email"
              placeholder="nom@exemple.fr"
              required
              sublabel="pour se connecter et récupérer son mot de passe en cas d'oubli"
              type="email"
            />
            <Field
              autoComplete="new-password"
              label="Mot de passe"
              name="password"
              placeholder="Mon mot de passe"
              required
              sublabel="pour se connecter"
              type="password"
            />
            <br />
            <Field
              label={(
                <span className="subtitle">
                  {' '}
                  {
                    "J'accepte d'être contacté par mail pour donner mon avis sur le"
                  }
                  {' '}
                  <a
                    href="http://passculture.beta.gouv.fr"
                    style={{ textDecoration: 'underline' }}
                  >
                    Pass Culture
                  </a>
                  .
                </span>
)}
              name="contact_ok"
              required
              type="checkbox"
            />

            <Portal node={this.state.$footer}>
              <SubmitButton className="button is-primary is-inverted">
                Créer
              </SubmitButton>
              <NavLink to="/connexion" className="button is-secondary">
                {"J'ai déjà un compte"}
              </NavLink>
            </Portal>
          </Form>
        </div>

        <footer
          ref={_e => {
            this.$footer = _e
          }}
        />
      </Main>
    )
  }
}

export default SignupPage
