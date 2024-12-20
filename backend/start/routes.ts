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

import Route from '@ioc:Adonis/Core/Route'
import AutoSwagger from "adonis-autoswagger";
import swagger from "Config/swagger";

// returns swagger in YAML
Route.get("/swagger", async () => {
  return AutoSwagger.docs(Route.toJSON(), swagger);
});

// Renders Swagger-UI and passes YAML-output of /swagger
Route.get("/docs", async () => {
  return AutoSwagger.ui("/swagger", swagger);
});

Route.post('/auth/login', 'AuthController.login')
Route.post('/auth/refreshToken', 'AuthController.refreshToken')
Route.post('/auth/signup', 'AuthController.signup')
Route.post('/auth/logout', 'AuthController.logout').middleware('auth:api')
Route.get('/auth/me', 'AuthController.me').middleware('auth:api')
Route.get('/auth/google/redirect', 'AuthController.googleRedirect')
Route.get('/auth/google/callback', 'AuthController.googleCallback')

Route.post('/auth/google/loginWithIosGoogleToken', 'AuthController.loginWithIosGoogleToken')

Route.get('/teams/absencesInLatestEvents', 'TeamsController.absencesInLatestEvents').middleware('auth:api')
Route.resource('teams', 'TeamsController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })
Route.post('/teams/:id/removeUser', 'TeamsController.removeUser').middleware('auth:api')
Route.post('/teams/:id/exit', 'TeamsController.exit').middleware('auth:api')
Route.post('/teams/:id/updatePreference', 'TeamsController.updatePreference').middleware('auth:api')

Route.get('/teammates/mostAbsenceForTeammates', 'TeammatesController.mostAbsenceForTeammates').middleware('auth:api')
Route.put('/teammates/:id', 'TeammatesController.update').middleware('auth:api')

Route.post('/groups', 'GroupsController.store').middleware('auth:api')
Route.get('/teams/:teamId/groups', 'GroupsController.index').middleware('auth:api')
Route.put('/groups/:id', 'GroupsController.update').middleware('auth:api')
Route.delete('/groups/:id', 'GroupsController.destroy').middleware('auth:api')
Route.get('/groups/:id', 'GroupsController.show').middleware('auth:api')
  
Route.resource('users', 'UsersController')
  .only([ 'index', 'store', 'update', 'show', 'destroy' ])
  .middleware({
    '*': ['auth:api']
  })

Route.post('/invitations/inviteUser', 'InvitationsController.inviteUser').middleware('auth:api')
Route.get('/invitations/list', 'InvitationsController.list').middleware('auth:api')
Route.post('/invitations/accept', 'InvitationsController.accept').middleware('auth:api')
Route.post('/invitations/reject', 'InvitationsController.reject').middleware('auth:api')
Route.post('/invitations/discard', 'InvitationsController.discard').middleware('auth:api')

Route.post('/events', 'EventsController.store').middleware('auth:api')
Route.post('/events/createWithFrequency', 'EventsController.createWithFrequency').middleware('auth:api')
Route.post('/events/copyWeek', 'EventsController.copyWeek').middleware('auth:api')
Route.get('/events', 'EventsController.index').middleware('auth:api')
Route.put('/events/:id', 'EventsController.update').middleware('auth:api')
Route.delete('/events/:id', 'EventsController.destroy').middleware('auth:api')
Route.get('/events/:id', 'EventsController.show').middleware('auth:api')
Route.post('/events/:id/convocate', 'EventsController.convocate').middleware('auth:api')
Route.post('/events/:id/unConvocate', 'EventsController.unConvocate').middleware('auth:api')

Route.resource('eventSessions', 'EventSessionsController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })

Route.resource('shirts', 'ShirtsController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })

Route.post('/scouts/analysis/totalSpikeForPosition', 'ScoutAnalysisController.totalSpikeForPosition').middleware('auth:api')
Route.post('/scouts/analysis/totalSpikeForPlayer', 'ScoutAnalysisController.totalSpikeForPlayer').middleware('auth:api')
Route.post('/scouts/analysis/totalSpikeForPlayerAndPosition', 'ScoutAnalysisController.totalSpikeForPlayerAndPosition').middleware('auth:api')
Route.post('/scouts/analysis/totalServe', 'ScoutAnalysisController.totalServe').middleware('auth:api')
Route.post('/scouts/analysis/totalServeByPlayer', 'ScoutAnalysisController.totalServeByPlayer').middleware('auth:api')

Route.get('/scouts/:id/studio', 'ScoutsController.studio').middleware('auth:api')
Route.get('/scouts/:id/getFirstSetStartingSix', 'ScoutsController.getFirstSetStartingSix').middleware('auth:api')
Route.get('/scouts/:id/exportXlsx', 'ScoutsController.exportXlsx').middleware('auth:api')
Route.post('/scouts/:id/importTeammates', 'ScoutsController.importTeammates').middleware('auth:api')
Route.post('/scouts/:id/events/add', 'ScoutEventsController.add').middleware('auth:api')
Route.resource('scouts', 'ScoutsController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })

Route.get('/players/:id/lastScoutEvents', 'PlayersController.lastScoutEvents').middleware('auth:api')
Route.resource('players', 'PlayersController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })

Route.resource('scoringSystems', 'ScoringSystemsController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api']
  })

Route.resource('dashboards', 'DashboardsController')
  .only(['index', 'store', 'update', 'show', 'destroy'])
  .middleware({
    '*': ['auth:api'],
  })

Route.get('/widgets/loadDistribution', 'WidgetsController.loadDistribution').middleware('auth:api')
Route.get('/widgets/loadServeSummary', 'WidgetsController.loadServeSummary').middleware('auth:api')
Route.get('/widgets/:id', 'WidgetsController.show').middleware('auth:api')

Route.post('/widgetSettings/set', 'WidgetSettingsController.set').middleware('auth:api')

Route.post('/convocations/:id/confirm', 'ConvocationsController.confirm').middleware('auth:api')
Route.post('/convocations/:id/deny', 'ConvocationsController.deny').middleware('auth:api')

Route.post('/solana/reward', 'SolanaController.reward').middleware('auth:api')