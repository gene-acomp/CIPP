import React from 'react'
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCol,
  CFormLabel,
  CListGroup,
  CListGroupItem,
  CRow,
  CCardHeader,
  CCardTitle,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faTimesCircle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import Wizard from '../../../components/Wizard'
import PropTypes from 'prop-types'
import { RFFCFormInput, RFFCFormSwitch, RFFSelectSearch } from '../../../components/RFFComponents'
import { TenantSelector } from 'src/components/cipp'
import { useListUsersQuery } from 'src/store/api/users'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CAlert color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CAlert>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const OffboardingWizard = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    const shippedValues = {
      TenantFilter: tenantDomain,
      ...values,
    }
    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ url: 'api/Execoffboarduser', values: shippedValues })
  }

  return (
    <CCard>
      <CCardHeader>
        <CCardTitle className="text-primary">Offboarding Wizard</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <div className="bg-white rounded p-5">
          <CRow className="row justify-content-center">
            <CCol xxl={8}>
              <Wizard onSubmit={handleSubmit}>
                <Wizard.Page
                  title="Tenant Choice"
                  description="Choose the tenants for offboarding the user"
                >
                  <center>
                    <h3 className="text-primary">Step 1</h3>
                    <h5 className="card-title mb-4">Choose a tenant</h5>
                  </center>
                  <hr className="my-4" />
                  <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                  <hr className="my-4" />
                </Wizard.Page>
                <Wizard.Page
                  title="Select User"
                  description="Select the user to offboard from the tenant."
                >
                  <center>
                    <h3 className="text-primary">Step 2</h3>
                    <h5>Select the user that will be offboarded</h5>
                  </center>
                  <hr className="my-4" />
                  <div className="mb-2">
                    <RFFSelectSearch
                      label={'Users in ' + tenantDomain}
                      values={users?.map((user) => ({
                        value: user.mail,
                        name: user.displayName,
                      }))}
                      placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                      name="User"
                    />
                    {usersError && <span>Failed to load list of users</span>}
                  </div>
                  <hr className="my-4" />
                </Wizard.Page>
                <Wizard.Page
                  title="Offboarding Settings"
                  description="Select the offboarding options."
                >
                  <center>
                    <h3 className="text-primary">Step 3</h3>
                    <h5>Choose offboarding options</h5>
                  </center>
                  <hr className="my-4" />
                  <div className="mb-2">
                    <RFFCFormSwitch name="RemoveLicenses" label="Remove Licenses" />
                    <RFFCFormSwitch name="ConvertToShared" label="Convert to Shared Mailbox" />
                    <RFFCFormSwitch name="DisableSignIn" label="Disable Sign in" />
                    <RFFCFormSwitch name="ResetPass" label="Reset Password" />
                    <RFFCFormSwitch name="RemoveGroups" label="Remove from all groups" />
                    <RFFCFormSwitch name="HideFromGAL" label="Hide from Global Address List" />
                    <CCol md={6}>
                      <RFFCFormInput
                        name="OOO"
                        label="Out of Office"
                        type="text"
                        placeholder="leave blank to not set"
                      />
                    </CCol>
                    <CCol md={6}>
                      <RFFSelectSearch
                        label="Give other user full access on mailbox without automapping"
                        values={users?.map((user) => ({
                          value: user.mail,
                          name: user.displayName,
                        }))}
                        placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                        name="AccessNoAutomap"
                      />
                    </CCol>
                    <CCol md={6}>
                      <RFFSelectSearch
                        label="Give other user full access on mailbox with automapping"
                        values={users?.map((user) => ({
                          value: user.mail,
                          name: user.displayName,
                        }))}
                        placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                        name="AccessAutomap"
                      />
                    </CCol>
                    <CCol md={6}>
                      <RFFSelectSearch
                        label="Give other user full access on Onedrive"
                        values={users?.map((user) => ({
                          value: user.mail,
                          name: user.displayName,
                        }))}
                        placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                        name="UserAutomapOneDrive"
                      />
                    </CCol>
                    <RFFCFormSwitch name="DeleteUser" label="Delete user" />
                  </div>
                  <hr className="my-4" />
                </Wizard.Page>
                <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
                  <center>
                    <h3 className="text-primary">Step 4</h3>
                    <h5 className="mb-4">Confirm and apply</h5>
                    <hr className="my-4" />
                  </center>
                  <div className="mb-2">
                    {postResults.isSuccess && (
                      <CAlert color="success">{postResults.data.Results}</CAlert>
                    )}
                    {!postResults.isSuccess && (
                      <FormSpy>
                        {(props) => {
                          /* eslint-disable react/prop-types */
                          return (
                            <>
                              <CRow>
                                <CCol md={3}></CCol>
                                <CCol md={6}>
                                  <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Remove Licenses
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.RemoveLicenses
                                            ? faCheckCircle
                                            : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Convert to Shared
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.ConvertToShared
                                            ? faCheckCircle
                                            : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Disable Sign-in
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.DisableSignIn ? faCheckCircle : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Reset Password
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.ResetPass ? faCheckCircle : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Remove from all groups
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.RemoveGroups ? faCheckCircle : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Hide from Global Address List
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.HideFromGAL ? faCheckCircle : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Set Out of Office
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={props.values.OOO ? faCheckCircle : faTimesCircle}
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Give another user access to the mailbox with automap
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.UserNoAutomap ? faCheckCircle : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Give another user access to the mailbox without automap
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={
                                          props.values.UserAutomap ? faCheckCircle : faTimesCircle
                                        }
                                      />
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center">
                                      Give another user access to OneDrive
                                      <FontAwesomeIcon
                                        color="#f77f00"
                                        size="lg"
                                        icon={props.values.OneDrive ? faCheckCircle : faTimesCircle}
                                      />
                                    </CListGroupItem>
                                  </CListGroup>
                                </CCol>
                                {/* eslint-disable-next-line react/prop-types */}
                                {/* <pre>{JSON.stringify(props.values, undefined, 3)}</pre>*/}
                              </CRow>
                            </>
                          )
                        }}
                      </FormSpy>
                    )}
                  </div>

                  <hr className="my-4" />
                </Wizard.Page>
              </Wizard>
            </CCol>
          </CRow>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default OffboardingWizard
