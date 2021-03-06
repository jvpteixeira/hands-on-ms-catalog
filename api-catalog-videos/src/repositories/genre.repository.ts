import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {Client} from 'es6';
import {Esv7DataSource} from '../datasources';
import {Genre, GenreRelations} from '../models';

export class GenreRepository extends DefaultCrudRepository<
  Genre,
  typeof Genre.prototype.id,
  GenreRelations
> {
  constructor(
    @inject('datasources.esv7') dataSource: Esv7DataSource,
  ) {
    super(Genre, dataSource);
  }

  async attachCategories(genreId: typeof Genre.prototype.id, data: object[]){
    const document = {
      "index": this.dataSource.settings.index,
      "refresh": true,
      "query":{
        "term":{
          "_id": genreId
        }
      },
      "script": {
        "source":`
          if ( !ctx._source.containsKey('categories')){
            ctx._source['categories'] = []
          }


          for(item in params['categories']){
            if( !ctx._source['categories'].find( i -> i.id == item.id) == null ){
              ctx._source['categories'].add(item)
            }
          }

        `,
        "params":{
          "categories": data
        }
      }
    }

    const db: Client = this.dataSource.connector?.db;
    db.update_by_query(document);
  }




}
