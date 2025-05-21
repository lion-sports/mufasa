/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/Http/AuthController')
const TeamsController = () => import('#controllers/Http/TeamsController')
const GroupsController = () => import('#controllers/Http/GroupsController')
const UsersController = () => import('#controllers/Http/UsersController')
const InvitationsController = () => import('#controllers/Http/InvitationsController')
const EventsController = () => import('#controllers/Http/EventsController')
const EventSessionsController = () => import('#controllers/Http/EventSessionsController')
const ShirtsController = () => import('#controllers/Http/ShirtsController')
const ScoutAnalysisController = () => import('#controllers/Http/ScoutAnalysisController')
const ScoutsController = () => import('#controllers/Http/ScoutsController')
const ScoutEventsController = () => import('#controllers/Http/ScoutEventsController')
const PlayersController = () => import('#controllers/Http/PlayersController')
const ScoringSystemsController = () => import('#controllers/Http/ScoringSystemsController')
const DashboardController = () => import('#controllers/Http/DashboardsController')
const WidgetsController = () => import('#controllers/Http/WidgetsController')
const WidgetSettingsController = () => import('#controllers/Http/WidgetSettingsController')
const ConvocationsController = () => import('#controllers/Http/ConvocationsController')
const SolanaController = () => import('#controllers/Http/SolanaController')
const TeammatesController = () => import('#controllers/Http/TeammatesController')
const MediaController = () => import('#controllers/Http/MediaController')
const ClubsController = () => import('#controllers/Http/ClubsController')
const UserSettingsController = () => import('#controllers/Http/UserSettingsController')

router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/refreshToken', [AuthController, 'refreshToken'])
router.post('/auth/signup', [AuthController, 'signup'])
router.post('/auth/logout', [AuthController, 'logout']).use(middleware.auth({
  guards: ['api']
}))
router.get('/auth/me', [AuthController, 'me']).use(middleware.auth({
  guards: ['api']
}))
router.get('/auth/google/redirect', [AuthController, 'googleRedirect'])
router.get('/auth/google/callback', [AuthController, 'googleCallback'])
router.post('/auth/google/loginWithIosGoogleToken', [AuthController, 'loginWithIosGoogleToken'])

router.group(() => {
  router.get('/absencesInLatestEvents', [TeamsController, 'absencesInLatestEvents'])
  router.post('/:id/removeUser', [TeamsController, 'removeUser'])
  router.post('/:id/exit', [TeamsController, 'exit'])
  router.post('/:id/updatePreference', [TeamsController, 'updatePreference'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/teams')

router.resource('teams', TeamsController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.group(() => {
  router.get('/mostAbsenceForTeammates', [TeammatesController, 'mostAbsenceForTeammates'])
  router.put('/:id', [TeammatesController, 'update'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/teammates')


router.group(() => {
  router.get('/', [GroupsController, 'index'])
  router.post('/', [GroupsController, 'store'])
  router.put('/:id', [GroupsController, 'update'])
  router.delete('/:id', [GroupsController, 'destroy'])
  router.get('/:id', [GroupsController, 'show'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/groups')
  
router.resource('users', UsersController)
  .only(['index', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.group(() => {
    router.post('/inviteUser', [InvitationsController, 'inviteUser'])
    router.post('/inviteUserByUrl', [InvitationsController, 'inviteUserByUrl'])
    router.get('/list', [InvitationsController, 'list'])
    router.post('/accept', [InvitationsController, 'accept'])
    router.post('/reject', [InvitationsController, 'reject'])
    router.post('/discard', [InvitationsController, 'discard'])
  })
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/invitations')

router.group(() => {
  router.post('/', [EventsController, 'store'])
  router.post('/createWithFrequency', [EventsController, 'createWithFrequency'])
  router.post('/copyWeek', [EventsController, 'copyWeek'])
  router.get('/', [EventsController, 'index'])
  router.put('/:id', [EventsController, 'update'])
  router.delete('/:id', [EventsController, 'destroy'])
  router.get('/:id', [EventsController, 'show'])
  router.post('/:id/convocate', [EventsController, 'convocate'])
  router.post('/:id/unConvocate', [EventsController, 'unConvocate'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/events')

router.resource('eventSessions', EventSessionsController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.resource('shirts', ShirtsController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.group(() => {
  router.group(() => {
    router.post('/totalSpikeForPosition', [ScoutAnalysisController, 'totalSpikeForPosition'])
    router.post('/totalSpikeForPlayer', [ScoutAnalysisController, 'totalSpikeForPlayer'])
    router.post('/totalSpikeForPlayerAndPosition', [ScoutAnalysisController, 'totalSpikeForPlayerAndPosition'])
    router.post('/totalServe', [ScoutAnalysisController, 'totalServe'])
    router.post('/totalServeByPlayer', [ScoutAnalysisController, 'totalServeByPlayer'])
    router.post('/totalBlock', [ScoutAnalysisController, 'totalBlock'])
    router.post('/totalBlockByPlayer', [ScoutAnalysisController, 'totalBlockByPlayer'])
    router.post('/totalReceive', [ScoutAnalysisController, 'totalReceive'])
    router.post('/totalReceiveByPlayer', [ScoutAnalysisController, 'totalReceiveByPlayer'])
    router.post('/pointsHistory', [ScoutAnalysisController, 'pointsHistory'])
    router.post('/trend', [ScoutAnalysisController, 'trend'])
  }).prefix('/analysis')
  
  router.get('/:id/studio', [ScoutsController, 'studio'])
  router.get('/:id/getFirstSetStartingSix', [ScoutsController, 'getFirstSetStartingSix'])
  router.get('/:id/exportXlsx', [ScoutsController, 'exportXlsx'])
  router.post('/:id/importTeammates', [ScoutsController, 'importTeammates'])
  router.post('/:id/events/add', [ScoutEventsController, 'add'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/scouts')

router.resource('scouts', ScoutsController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.group(() => {
  router.get('/:id/lastScoutEvents', [PlayersController, 'lastScoutEvents'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/players')

router.resource('players', PlayersController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.resource('scoringSystems', ScoringSystemsController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.resource('dashboards', DashboardController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.group(() => {
  router.post('/:id/uploadMedia', [ClubsController, 'uploadMedia'])
  router.get('/media/:id/downloadThumbnail', [ClubsController, 'downloadThumbnail'])
  router.get('/media/:id/download', [ClubsController, 'downloadMedia'])
  router.get('/media/:id/show', [ClubsController, 'showMedia'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/clubs')

router.resource('clubs', ClubsController)
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware(
    '*', middleware.auth({
      guards: ['api']
    })
  )

router.group(() => {
  router.get('/loadDistribution', [WidgetsController, 'loadDistribution'])
  router.get('/loadServeSummary', [WidgetsController, 'loadServeSummary'])
  router.get('/loadBlockSummary', [WidgetsController, 'loadBlockSummary'])
  router.get('/loadReceiveSummary', [WidgetsController, 'loadReceiveSummary'])
  router.get('/loadTrend', [WidgetsController, 'loadTrend'])
  router.get('/:id', [WidgetsController, 'show'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/widgets')


router.group(() => {
  router.post('/set', [WidgetSettingsController, 'set'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/widgetSettings')

router.group(() => {
  router.post('/set', [UserSettingsController, 'set'])
  router.get('/get', [UserSettingsController, 'get'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/userSettings')

router.group(() => {
  router.post('/:id/confirm', [ConvocationsController, 'confirm'])
  router.post('/:id/deny', [ConvocationsController, 'deny'])
})
  .use(middleware.auth({
    guards: ['api']
  }))
  .prefix('/convocations')

router.post('/solana/reward', [SolanaController, 'reward']).use(middleware.auth({
  guards: ['api']
}))