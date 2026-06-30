import { buildMicrositePath } from '@livestock/ui-services'
import { taxonomy } from '@livestock/taxonomy-move'
import { species } from '@livestock/species-cattle'

export const homeController = {
  handler(request, h) {
    const displayName =
      [request.app.hubAuth?.firstName, request.app.hubAuth?.lastName]
        .filter(Boolean)
        .join(' ') || null
    const signedInAs =
      request.app.hubAuth?.email ??
      displayName ??
      request.app.hubAuth?.sub ??
      'Authenticated user'

    return h.view('home/index', {
      pageTitle: 'Move for Cattle',
      heading: 'Move for Cattle',
      caption: 'Spoke microsite',
      taxonomy,
      species,
      signedInAs,
      directPort: 3204,
      hubPath: buildMicrositePath(taxonomy.id, species.id),
      apiEndpoint: 'http://localhost:3000/api/species/cattle/taxonomies/move'
    })
  }
}
