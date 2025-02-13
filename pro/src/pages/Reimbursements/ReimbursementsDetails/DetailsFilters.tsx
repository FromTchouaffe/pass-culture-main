import React, { Dispatch, SetStateAction, useState } from 'react'

import FormLayout from 'components/FormLayout/FormLayout'
import { SelectOption } from 'custom_types/form'
import { Button } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'
import PeriodSelector from 'ui-kit/form/PeriodSelector/PeriodSelector'
import SelectInput from 'ui-kit/form/Select/SelectInput'
import { FieldLayout } from 'ui-kit/form/shared'
import { getToday } from 'utils/date'

import styles from './DetailsFilters.module.scss'
type FiltersType = {
  venue: string
  periodStart: string
  periodEnd: string
}

interface ReimbursementsSectionHeaderProps {
  children: React.ReactNode | React.ReactNode[]
  defaultSelectDisplayName: string
  defaultSelectId: string
  filters: FiltersType
  headerTitle: string
  initialFilters: FiltersType
  selectLabel: string
  selectName: string
  setFilters: Dispatch<SetStateAction<FiltersType>>
  selectableOptions: SelectOption[]
}

const DetailsFilters = ({
  children,
  defaultSelectDisplayName,
  defaultSelectId,
  headerTitle,
  initialFilters,
  selectLabel,
  selectName,
  selectableOptions,
  filters,
  setFilters,
}: ReimbursementsSectionHeaderProps): JSX.Element => {
  const {
    venue: selectedVenue,
    periodStart: selectedPeriodStart,
    periodEnd: selectedPeriodEnd,
  } = filters

  const [areFiltersDefault, setAreFiltersDefault] = useState(true)

  function resetFilters() {
    setAreFiltersDefault(true)
    setFilters(initialFilters)
  }

  const setVenueFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const venueId = event.target.value
    setFilters((prevFilters: FiltersType) => ({
      ...prevFilters,
      venue: venueId,
    }))
    setAreFiltersDefault(false)
  }

  const setStartDateFilter = (startDate: string) => {
    setFilters((prevFilters: FiltersType) => ({
      ...prevFilters,
      periodStart: startDate,
    }))
    setAreFiltersDefault(false)
  }

  const setEndDateFilter = (endDate: string) => {
    setFilters((prevFilters: FiltersType) => ({
      ...prevFilters,
      periodEnd: endDate,
    }))
    setAreFiltersDefault(false)
  }

  return (
    <>
      <div className="header">
        <h2 className="header-title">{headerTitle}</h2>
        <Button
          className={styles['reset-filters']}
          disabled={areFiltersDefault}
          onClick={resetFilters}
          type="button"
          variant={ButtonVariant.TERNARYPINK}
        >
          Réinitialiser les filtres
        </Button>
      </div>

      <FormLayout.Row inline>
        <FieldLayout label={selectLabel} name={selectName}>
          <SelectInput
            defaultOption={{
              label: defaultSelectDisplayName,
              value: defaultSelectId,
            }}
            onChange={setVenueFilter}
            name={selectName}
            options={selectableOptions}
            value={selectedVenue}
          />
        </FieldLayout>

        <fieldset>
          <legend>Période</legend>
          <PeriodSelector
            onBeginningDateChange={setStartDateFilter}
            onEndingDateChange={setEndDateFilter}
            isDisabled={false}
            maxDateEnding={getToday()}
            periodBeginningDate={selectedPeriodStart}
            periodEndingDate={selectedPeriodEnd}
          />
        </fieldset>
      </FormLayout.Row>

      <div className="button-group">
        <span className="button-group-separator" />
        <div className="button-group-buttons">{children}</div>
      </div>
    </>
  )
}

export default DetailsFilters
