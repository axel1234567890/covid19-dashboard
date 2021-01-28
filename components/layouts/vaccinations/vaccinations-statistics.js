import React, {useState, useMemo, useEffect, useContext} from 'react'
import {BarChart2} from 'react-feather'

import colors from '../../../styles/colors'

import {AppContext} from '../../../pages'

import {getPreviousReport, getReport} from '../../../lib/data'

import IndicateurCumulChart from '../../charts/indicateur-cumul'
import IndicateurVariationChart from '../../charts/indicateur-variation'

import VaccinationsCounters from './vaccinations-counters'

import {VaccinationsContext} from '.'

const charts = {
  nouvellesPremieresInjections: {
    name: 'Premières injections réalisées (un jour)',
    type: 'indicateur',
    options: {
      label: 'Premières injections réalisées (un jour)',
      metricName: 'nouvellesPremieresInjections',
      color: 'green'
    }
  },
  cumulPremieresInjections: {
    name: 'Premières injections réalisées (cumul)',
    type: 'indicateur',
    options: {
      label: 'Premières injections réalisées (cumul)',
      metricName: 'cumulPremieresInjections',
      color: 'green'
    }
  },
  stockNombreTotalDoses: {
    name: 'Doses de vaccins en stock',
    type: 'indicateur',
    options: {
      label: 'Doses de vaccins en stock',
      metricName: 'stockNombreTotalDoses',
      color: 'darkGrey'
    }
  },
  stockNombreDosesPfizer: {
    name: 'Doses de vaccins en stock (Pfizer)',
    type: 'indicateur',
    options: {
      label: 'Doses de vaccins en stock (Pfizer)',
      metricName: 'stockNombreDosesPfizer',
      color: 'darkGrey'
    }
  },
  stockNombreDosesModerna: {
    name: 'Doses de vaccins en stock (Moderna)',
    type: 'indicateur',
    options: {
      label: 'Doses de vaccins en stock (Moderna)',
      metricName: 'stockNombreDosesModerna',
      color: 'darkGrey'
    }
  },
  livraisonsCumulNombreTotalDoses: {
    name: 'Doses de vaccins livrées',
    type: 'indicateur',
    options: {
      label: 'Doses de vaccins livrées',
      metricName: 'livraisonsCumulNombreTotalDoses',
      color: 'darkGrey'
    }
  },
  livraisonsCumulNombreDosesPfizer: {
    name: 'Doses de vaccins livrées (Pfizer)',
    type: 'indicateur',
    options: {
      label: 'Doses de vaccins livrées (Pfizer)',
      metricName: 'livraisonsCumulNombreDosesPfizer',
      color: 'darkGrey'
    }
  },
  livraisonsCumulNombreDosesModerna: {
    name: 'Doses de vaccins livrées (Moderna)',
    type: 'indicateur',
    options: {
      label: 'Doses de vaccins livrées (Moderna)',
      metricName: 'livraisonsCumulNombreDosesModerna',
      color: 'darkGrey'
    }
  },
  totalPrisesRendezVousSemaine: {
    name: 'Rendez-vous pris sur une semaine (toute injection)',
    type: 'indicateur',
    options: {
      label: 'Nombre total de doses de vaccins (toute injection)',
      metricName: 'totalPrisesRendezVousSemaine',
      color: 'darkGrey'
    }
  },
  prisesRendezVousSemaineRang1: {
    name: 'Rendez-vous pris sur une semaine (première injection)',
    type: 'indicateur',
    options: {
      label: 'Rendez-vous pris sur une semaine (première injection)',
      metricName: 'prisesRendezVousSemaineRang1',
      color: 'darkGrey'
    }
  },
  prisesRendezVousSemaineRang2: {
    name: 'Rendez-vous pris sur une semaine (seconde injection)',
    type: 'indicateur',
    options: {
      label: 'Rendez-vous pris sur une semaine (seconde injection)',
      metricName: 'prisesRendezVousSemaineRang2',
      color: 'darkGrey'
    }
  }
}

const VaccinationsStatistics = () => {
  const {date, selectedLocation, setSelectedLocation, isMobileDevice} = useContext(AppContext)
  const {selectedStat} = useContext(VaccinationsContext)

  const [report, setReport] = useState(null)
  const [previousReport, setPreviousReport] = useState(null)
  const [showVariations, setShowVariations] = useState(false)

  const Chart = useMemo(() => {
    const chart = charts[selectedStat]
    if (chart) {
      if (chart.type === 'indicateur') {
        return showVariations ? IndicateurVariationChart : IndicateurCumulChart
      }
    }
  }, [selectedStat, showVariations])

  const isToggleable = useMemo(() => {
    if (Chart) {
      return charts[selectedStat].type === 'indicateur'
    }

    return false
  }, [Chart, selectedStat])

  const selectedChartOptions = useMemo(() => {
    if (Chart) {
      return charts[selectedStat].options || {}
    }
  }, [Chart, selectedStat])

  useEffect(() => {
    async function fetchReport() {
      setReport(await getReport(date, selectedLocation))
    }

    fetchReport()
  }, [date, selectedLocation])

  useEffect(() => {
    async function fetchPreviousReport() {
      setPreviousReport(await getPreviousReport(report))
    }

    if (report) {
      fetchPreviousReport()
    }
  }, [report])

  return (
    <>
      <div className='header'>
        {selectedLocation && !isMobileDevice && (
          <div onClick={() => setSelectedLocation('FRA')} className='back'><BarChart2 /> <span>France</span></div>
        )}
        <h3>COVID-19 - {report ? report.nom : 'France'}</h3>
      </div>

      {report && (
        <VaccinationsCounters report={report} previousReport={previousReport} />
      )}

      {report && report.history && selectedStat && Chart && (
        <>
          {isToggleable && <a className='toggle' onClick={() => setShowVariations(!showVariations)}>{showVariations ? 'Afficher les valeurs cumulées' : 'Afficher les variations quotidiennes'}</a>}
          <div className='chart-container'>
            <Chart reports={report.history.filter(r => date >= r.date)} {...selectedChartOptions} />
          </div>
        </>
      )}

      <style jsx>{`
        .header {
          z-index: 2;
          text-align: center;
          position: sticky;
          top: 0;
          background-color: white;
          padding: ${isMobileDevice ? '0.2em' : 0};
          box-shadow: 0 1px 4px ${colors.lightGrey};
        }

        .header h3 {
          margin: 0.4em;
        }

        .back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background: ${colors.lighterGrey};
          padding: 0.5em;
          font-size: larger;
        }

        .back span {
          margin: 0 0.5em;
        }

        .back:hover {
          cursor: pointer;
          background: ${colors.lightGrey};
        }

        .toggle {
          padding: 2px 20px;
          text-align: right;
          font-size: 0.8em;
          cursor: pointer;
        }
        `}</style>
    </>
  )
}

export default VaccinationsStatistics