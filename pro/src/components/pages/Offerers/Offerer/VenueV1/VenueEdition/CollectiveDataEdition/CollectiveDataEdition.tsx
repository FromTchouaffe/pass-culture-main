import { FormikProvider, useFormik } from 'formik'
import {
  MultiSelectAutocomplete,
  Select,
  TextArea,
  TextInput,
  Title,
} from 'ui-kit'
import React, { useEffect, useState } from 'react'
import {
  getCulturalPartnersAdapter,
  getVenueEducationalStatusesAdapter,
} from './adapters'

import { CollectiveDataFormValues } from './type'
import FormLayout from 'new_components/FormLayout'
import { GET_DATA_ERROR_MESSAGE } from 'core/shared'
import { SelectOption } from 'custom_types/form'
import { StudentLevels } from 'apiClient/v1'
import { getEducationalDomainsAdapter } from 'core/OfferEducational'
import { handleAllFranceDepartmentOptions } from './utils/handleAllFranceDepartmentOptions'
import { interventionOptions } from './interventionOptions'
import styles from './CollectiveDataEdition.module.scss'
import useNotification from 'components/hooks/useNotification'
import { validationSchema } from './validationSchema'

const initialValues: CollectiveDataFormValues = {
  collectiveDescription: '',
  collectiveStudents: [],
  collectiveWebsite: '',
  collectivePhone: '',
  collectiveEmail: '',
  collectiveDomains: [],
  collectiveLegalStatus: '',
  collectiveNetwork: [],
  collectiveInterventionArea: [],
}

const studentOptions = [
  { value: StudentLevels.COLL_GE_4E, label: StudentLevels.COLL_GE_4E },
  { value: StudentLevels.COLL_GE_3E, label: StudentLevels.COLL_GE_3E },
  { value: StudentLevels.CAP_1RE_ANN_E, label: StudentLevels.CAP_1RE_ANN_E },
  { value: StudentLevels.CAP_2E_ANN_E, label: StudentLevels.CAP_2E_ANN_E },
  { value: StudentLevels.LYC_E_SECONDE, label: StudentLevels.LYC_E_SECONDE },
  { value: StudentLevels.LYC_E_PREMI_RE, label: StudentLevels.LYC_E_PREMI_RE },
  {
    value: StudentLevels.LYC_E_TERMINALE,
    label: StudentLevels.LYC_E_TERMINALE,
  },
]

const CollectiveDataEdition = (): JSX.Element => {
  const notify = useNotification()

  const [domains, setDomains] = useState<SelectOption[]>([])
  const [statuses, setStatuses] = useState<SelectOption[]>([])
  const [culturalPartners, setCulturalPartners] = useState<SelectOption[]>([])
  const [previousInterventionValues, setPreviousInterventionValues] = useState<
    string[] | null
  >(null)

  const formik = useFormik<CollectiveDataFormValues>({
    initialValues,
    onSubmit: () => {},
    validationSchema,
  })

  useEffect(() => {
    Promise.all([
      getEducationalDomainsAdapter(),
      getVenueEducationalStatusesAdapter(),
      getCulturalPartnersAdapter(),
    ]).then(([domainsResponse, statusesResponse, culturalPartnersResponse]) => {
      if (
        [domainsResponse, statusesResponse, culturalPartnersResponse].some(
          response => !response.isOk
        )
      ) {
        notify.error(GET_DATA_ERROR_MESSAGE)
      }

      setDomains(domainsResponse.payload)
      setStatuses(statusesResponse.payload)
      setCulturalPartners(culturalPartnersResponse.payload)
    })
  }, [])

  useEffect(() => {
    handleAllFranceDepartmentOptions(
      formik.values.collectiveInterventionArea,
      previousInterventionValues,
      formik.setFieldValue
    )

    setPreviousInterventionValues(formik.values.collectiveInterventionArea)
  }, [formik.values.collectiveInterventionArea])

  return (
    <>
      <Title level={1}>Mes informations EAC</Title>
      <p className={styles.description}>
        Il s'agit d'un formulaire vous permettant de renseigner vos
        informattions EAC. Les informations renseignées seront visibles par les
        enseignants et chefs d'établissement sur Adage (Application Dédiée A la
        Généralisation de l'Education artistique et culturelle).
      </p>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <div className={styles.section}>
            Présentation de votre démarche EAC
          </div>
          <FormLayout.Row>
            <TextArea
              name="collectiveDescription"
              label="Ajoutez des informations complémentaires  concernant l’EAC."
              placeholder="Détaillez ici des informations complémentaires"
              maxLength={500}
              countCharacters
            />
          </FormLayout.Row>
          <FormLayout.Row>
            <MultiSelectAutocomplete
              fieldName="collectiveStudents"
              label="Public cible :"
              options={studentOptions}
              placeholder="Sélectionner un public cible"
              inline
              className={styles.row}
              hideTags
            />
          </FormLayout.Row>
          <FormLayout.Row>
            <TextInput
              name="collectiveWebsite"
              label="URL de votre site web :"
              placeholder="http://exemple.com"
              inline
              className={styles.row}
            />
          </FormLayout.Row>
          <div className={styles.section}>
            Informations du lieu relatives à l’EAC
          </div>
          <FormLayout.Row>
            <MultiSelectAutocomplete
              hideTags
              options={domains}
              fieldName="collectiveDomains"
              label="Domaine artistique et culturel :"
              placeholder="Sélectionner un ou plusieurs domaine(s)"
              className={styles.row}
              inline
            />
          </FormLayout.Row>
          <FormLayout.Row>
            <MultiSelectAutocomplete
              hideTags
              options={interventionOptions}
              fieldName="collectiveInterventionArea"
              label="Périmètre d’intervention :"
              placeholder="Séléctionner un territoire cible"
              className={styles.row}
              inline
            />
          </FormLayout.Row>
          <FormLayout.Row>
            <Select
              options={[
                { value: '', label: 'Sélectionner un statut' },
                ...statuses,
              ]}
              name="collectiveLegalStatus"
              label="Statut :"
              className={styles.row}
              placeholder="Association, établissement public..."
              inline
            />
          </FormLayout.Row>
          <FormLayout.Row>
            <MultiSelectAutocomplete
              options={culturalPartners}
              fieldName="collectiveNetwork"
              label="Réseaux partenaires EAC  :"
              className={styles.row}
              placeholder="Sélectionner un ou plusieurs réseaux partenaires"
              inline
              maxDisplayOptions={20}
              maxDisplayOptionsLabel="20 résultats maximum. Veuillez affiner votre recherche"
            />
          </FormLayout.Row>
          <div className={styles.section}>Contact pour les scolaires</div>
          <FormLayout.Row>
            <TextInput
              name="collectivePhone"
              label="Téléphone :"
              placeholder="0648592819"
              inline
              className={styles.row}
            />
          </FormLayout.Row>
          <FormLayout.Row>
            <TextInput
              name="collectiveEmail"
              label="E-mail :"
              placeholder="email@exemple.com"
              inline
              className={styles.row}
            />
          </FormLayout.Row>
        </form>
      </FormikProvider>
    </>
  )
}

export default CollectiveDataEdition
