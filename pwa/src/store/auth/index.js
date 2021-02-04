import Firebase from 'firebase/app'
import 'firebase/auth'
import {
  SQL_CREATE_USER_IF_NOT_EXISTING,
  sendApiRequest,
  SQL_GET_USER_DATA,
  SQL_UPDATE_DESCRIPTION,
  SQL_UPDATE_GENDER,
  SQL_UPDATE_LIFT_MAX_DISTANCE,
  SQL_UPDATE_PREFS,
  SQL_ADD_ADDRESS,
  SQL_REMOVE_ADDRESS,
  SQL_ADD_CAR,
  SQL_REMOVE_CAR,
  SQL_GET_MARKETPLACE,
  GET_MESSAGES,
  SQL_SEND_MESSAGE,
  SQL_ADD_LIFT,
  SQL_LEAVE_LIFT,
  SQL_GET_LIFT_REQUESTS,
  SQL_RESPOND_REQUEST,
  SQL_ADD_LIFT_REQUEST
} from '../../ApiAccess'

import { Notify } from 'quasar'
function errorNotify (msg) {
  Notify.create({
    type: 'negative',
    message: msg
  });
}

function successNotify (msg) {
  Notify.create({
    type: 'positive',
    message: msg
  });
}

export default {
  namespaced: true,

  state: {
    user: {},
    signinLoaded: false
  },

  getters: {
    user (state) {
      return state.user
    },

    isAuthenticated (state) {
      return !!state.user
    },

    signinLoaded (state) {
      return state.signinLoaded
    }
  },

  mutations: {
    SET_USER (state, payload) {
      state.user = JSON.parse(JSON.stringify(payload))
    },

    RESET_USER (state) {
      state.user = null
    },

    UPDATE_MARKETPLACE_OFFERS (state, payload) {
      state.user.marketplaceOffers = payload
    },

    UPDATE_CHAT_LIFTS (state, payload) {
      state.user.chatLifts = payload
    },

    UPDATE_DESCRIPTION (state, payload) {
      state.user.bio = payload
    },

    UPDATE_GENDER (state, payload) {
      state.user.gender = payload
    },

    UPDATE_LIFT_MAX_DISTANCE (state, payload) {
      state.user.settings.liftMaxDistance = payload
    },

    UPDATE_LIFT_REQUESTS (state, payload) {
      state.user.liftRequests = payload
    },

    UPDATE_PREFS (state, payload) {
      state.user.prefs = payload
    },

    LEAVE_LIFT (state, payload) {
      state.user.chatLifts = state.user.chatLifts.filter(l => l.id != payload)
    },

    SEND_MESSAGE (state, payload) {
      if (payload.content) { // fallback for empty messages
        var a = state.user.chatLifts.find(l => l.id == payload.liftId)
        a.messages.push({
          content: payload.content,
          sentBy: state.user.uid,
          type: payload.type,
          timestamp: payload.timestamp
        })
      }
    },

    ADD_ADDRESS (state, payload) {
      state.user.addresses.push(payload)
    },

    REMOVE_ADDRESS (state, payload) {
      state.user.addresses = state.user.addresses.filter(item => item.id != payload) // filters the one with matching id out
    },

    ADD_CAR (state, payload) {
      state.user.cars.push(payload)
    },

    REMOVE_CAR (state, carId) {
      state.user.cars = state.user.cars.filter(item => item.carId != carId) // filters the one with matching id out
    },

    SET_USER_DATA_LOADED (state, payload) {
      state.signinLoaded = payload
    },

    ACCEPT_LIFT_REQUEST (state, payload) {
      var requestedLift = state.user.liftRequests.find(l => l.liftId == payload.liftId)
      requestedLift.requestingUsers = requestedLift.requestingUsers.filter(u => u.id != payload.user.id)

      var chatLift = state.user.chatLifts.find(l => l.id == payload.liftId)
      chatLift.passengers.push(payload.user)
    },

    DENY_LIFT_REQUEST (state, payload) {
      var requestedLift = state.user.liftRequests.find(l => l.liftId == payload.liftId)
      requestedLift.requestingUsers = requestedLift.requestingUsers.filter(u => u.id != payload.userId)
    },

    RESPOND_ALL_REQUESTS (state, payload) {
      var chatLift = state.user.chatLifts.find(l => l.id == payload.liftId),
        usersThatWouldBeAdded = null

      state.user.liftRequests = state.user.liftRequests.filter(l => {
        var isWanted = l.liftId == payload.liftId
        if (payload.accepted && isWanted) usersThatWouldBeAdded = l.requestingUsers // before filtering it out, copy all the requesting users
        return !isWanted // negate it so that all other lifts stay and only the wanted one is filtered
      })

      if (payload.accepted) {
        var chatLift = state.user.chatLifts.find(l => l.id == payload.liftId)
        chatLift.passengers = chatLift.passengers.concat(usersThatWouldBeAdded)
      }

    },

    REQUEST_TO_LIFT (state, liftId) {
      state.user.marketplaceOffers = state.user.marketplaceOffers.filter(offer => offer.id != liftId)
    }
  },

  actions: {
    async signIn ({ commit }, payload) {
      let email = payload.email
      let password = payload.password

      await Firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(error => {
          alert('Bei der Anmeldung ist ein Problem aufgetreten: ' + error)
        })
    },

    async register ({ commit }, payload) {
      let email = payload.email
      let password = payload.password
      let name = payload.name
      let surname = payload.surname

      await Firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
          Firebase.auth().currentUser.updateProfile({
            displayName: name + " " + surname
          })
            .then(_ => {
              let currentUser = Firebase.auth().currentUser
              sendApiRequest(
                SQL_CREATE_USER_IF_NOT_EXISTING,
                { name, surname, mail: currentUser.email },
                _ => sendApiRequest(SQL_GET_USER_DATA, { fbid: currentUser.uid },
                  data => {
                    commit("SET_USER", data);
                    router.replace({ name: 'marketplace' }).catch(() => { })
                    new Vue(app) /* eslint-disable-line no-new */
                  },
                  error => dispatch('signOut')),
                error => {
                  dispatch('signOut');
                }
              );
            })
            .catch(error => {
              throw error
            })
        })
        .catch(error => {
          throw error
        })
    },

    async signOut ({ commit }) {
      await Firebase.auth().signOut()
        .then(() => {
          commit('RESET_USER')
        })
    },

    async updateDescription ({ commit }, payload) {
      sendApiRequest(
        SQL_UPDATE_DESCRIPTION,
        { description: payload },
        _ => commit('UPDATE_DESCRIPTION', payload),
        error => alert(error)
      );
    },

    async reloadMarketplaceOffers ({ commit }, callbacks) {
      sendApiRequest(
        SQL_GET_MARKETPLACE,
        {},
        (offers) => {
          commit('UPDATE_MARKETPLACE_OFFERS', offers)
          callbacks.res()
        },
        error => callbacks.rej(error)
      );
    },

    async reloadChatLifts ({ commit }, callbacks) {
      sendApiRequest(GET_MESSAGES, {}, chatLifts => {
        commit('UPDATE_CHAT_LIFTS', chatLifts)
        callbacks.res()
      }, err => callbacks.rej(err))
    },

    async leaveLift ({ commit }, payload) {
      sendApiRequest(SQL_LEAVE_LIFT, {
        liftId: payload
      }, _ => {
        commit('LEAVE_LIFT', payload)
      }, err => errorNotify(err))
    },

    async getLiftRequests ({ commit }, callbacks) {
      sendApiRequest(SQL_GET_LIFT_REQUESTS, {}, data => {
        commit('UPDATE_LIFT_REQUESTS', data.requests)
        callbacks.res()
      }, err => errorNotify(err))
    },

    async sendMessage ({ commit }, payload) {
      sendApiRequest(
        SQL_SEND_MESSAGE,
        { message: payload },
        data => commit('SEND_MESSAGE', Object.assign(payload, data)),
        error => errorNotify(error)
      );
    },

    async updatePrefs ({ commit }, payload) {
      sendApiRequest(
        SQL_UPDATE_PREFS,
        { prefs: payload },
        _ => {
          commit('UPDATE_PREFS', payload)
          successNotify('Deine Präferenzen wurden aktualisiert')
        },
        error => alert(error)
      );
    },

    async addAddress ({ commit }, payload) {
      sendApiRequest(
        SQL_ADD_ADDRESS,
        { address: payload },
        data => {
          commit('ADD_ADDRESS', Object.assign(
            payload, data
          ))
          successNotify('Adresse wurde hinzugefügt')
        },
        error => alert(error)
      )
    },

    async addLift ({ commit }, payload) {
      sendApiRequest(
        SQL_ADD_LIFT,
        { lift: payload },
        data => {
          commit('UPDATE_CHAT_LIFTS', data)
          /* successNotify('Mitfahrgelegenheit wurde veröffentlicht') // has been commented out because extra popup shows state and success messages */
        },
        error => errorNotify(error)
      )
    },
    async removeAddress ({ commit }, payload) {
      sendApiRequest(
        SQL_REMOVE_ADDRESS,
        { id: payload },
        _ => {
          successNotify('Adresse wurde entfernt.')
          commit('REMOVE_ADDRESS', payload)
        },
        error => {
          if (error.status == 424) errorNotify('Kann Adresse noch nicht entfernen: mindestens eine Mitfahrgelegenheit hängt davon ab')
          else errorNotify(error)
        }
      )
    },

    async addCar ({ commit }, payload) {
      sendApiRequest(
        SQL_ADD_CAR,
        { car: payload },
        data => {
          payload.carId = data.id
          commit('ADD_CAR', payload)
          successNotify('Fahrzeug wurde hinzugefügt')
        },
        err => {
          errorNotify(err)
        }
      )
    },

    async removeCar ({ commit }, payload) {
      sendApiRequest(
        SQL_REMOVE_CAR,
        { id: payload },
        _ => {
          commit('REMOVE_CAR', payload)
          successNotify('Fahrzeug wurde entfernt')
        },
        error => {
          if (error.status == 424) errorNotify('Kann Fahrzeug noch nicht entfernen: mindestens eine Mitfahrgelegenheit hängt davon ab')
          else errorNotify(error)
        }
      )
    },

    async updateGender ({ commit }, payload) {
      let gender = payload
      if (!['M', 'W', 'D', 'X'].includes(gender))
        switch (gender) {
          case 'Männlich':
            gender = 'M'
            break;
          case 'Weiblich':
            gender = 'W'
            break;
          case 'Divers':
            gender = 'D'
            break;
          case 'Sonstiges':
            gender = 'X'
            break;
          default:
            throw new Error("Can't parse gender '" + gender + "'!")
        }
      sendApiRequest(
        SQL_UPDATE_GENDER,
        { gender: gender },
        _ => commit('UPDATE_GENDER', gender),
        error => errorNotify(error)
      )
    },

    async updateLiftMaxDistance ({ commit }, payload) {
      sendApiRequest(
        SQL_UPDATE_LIFT_MAX_DISTANCE,
        { liftMaxDistance: payload },
        _ => {
          commit('UPDATE_LIFT_MAX_DISTANCE', payload)
          successNotify('Maximale Entfernung wurde aktualisiert')
        },
        error => errorNotify(error)
      );
    },

    async respondLiftRequest ({ commit }, payload) {
      var obj = { // re-build object, was easier to debug the structures
        liftId: payload.liftId,
        userId: payload.user.id,
        accepted: payload.accepted
      }

      sendApiRequest(SQL_RESPOND_REQUEST, obj, _ => {
        if (payload.user.id == -1) { // respond all requests
          commit('RESPOND_ALL_REQUESTS', {
            liftId: payload.liftId,
            accepted: payload.accepted
          })
          successNotify('Alle Anfragen zu dieser Mitfahrgelegenheit wurden ' + (payload.accepted ? 'akzeptiert' : 'abgelehnt'))
        }
        else {
          if (payload.accepted) {
            obj = { // re-build object to make local changes
              liftId: payload.liftId,
              user: payload.user
            }
            commit('ACCEPT_LIFT_REQUEST', obj)
          }
          else {
            obj = {
              liftId: payload.liftId,
              userId: payload.user.id // ATTENTION! HERE WILL ONLY USERID BE TRANSFERRED
            }
            commit('DENY_LIFT_REQUEST', obj)
          }
        }

      }, err => errorNotify(err))
    },

    async requestToLift ({ commit }, payload) {
      sendApiRequest(SQL_ADD_LIFT_REQUEST, {
        liftId: payload
      }, _ => {
        commit('REQUEST_TO_LIFT', payload)
      }, _ => {
        errorNotify('Konnte Anfrage nicht einstellen, möglicherweise hast du schon angefragt.')
      })
    }
  }
}