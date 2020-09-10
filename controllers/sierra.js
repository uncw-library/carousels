function getISBN(client, bib) {
  const sql = `
  SELECT DISTINCT varfield_view.field_content
  FROM sierra_view.bib_view


  LEFT JOIN sierra_view.varfield_view
  ON sierra_view.varfield_view.record_id=sierra_view.bib_view.id

  WHERE

  marc_tag='020'


  and sierra_view.bib_view.record_num=$1
  limit 1

  `;

  const values = [bib];

  return client.query(sql, values);
}

function getUPC(client, bib) {
  const sql = `
  SELECT DISTINCT field_content
  FROM sierra_view.bib_view


  LEFT JOIN sierra_view.varfield_view
  ON sierra_view.varfield_view.record_id=sierra_view.bib_view.id

  WHERE

  marc_tag='024'

  and sierra_view.bib_view.record_num=$1
  limit 1

  `;

  const values = [bib];

  return client.query(sql, values);
}

function getAddInfo(client, bib) {
  const sql = `
  SELECT is_available_at_library,call_number_norm as call_number,location_code, location_name.name as location
  FROM sierra_view.bib_view

  LEFT JOIN sierra_view.bib_record_item_record_link
  ON sierra_view.bib_view.id=sierra_view.bib_record_item_record_link.bib_record_id

  LEFT JOIN sierra_view.item_view
  ON sierra_view.bib_record_item_record_link.item_record_id=sierra_view.item_view.id

  LEFT JOIN sierra_view.item_record_property
  ON sierra_view.item_record_property.item_record_id=sierra_view.item_view.id

  LEFT JOIN sierra_view.location
  ON sierra_view.location.code=item_view.location_code

  LEFT JOIN sierra_view.location_name
  ON sierra_view.location_name.location_id=location.id

  WHERE  bib_view.record_num=$1
  `;

  const values = [bib];

  return client.query(sql, values);
}

function getNewlyAcquiredBooks(client, location = 'gen') {
  let locationConditions = '';
  let locationCodeField = 'location_code';
  let values = [];
  

  let sql = '';

 

    sql = `
    SELECT DISTINCT  bib_view.record_num,
    best_title as title,
    best_author as author,
    location_code as location,
    bib_view.record_num as recordnum

    FROM sierra_view.bib_view

    LEFT JOIN sierra_view.bib_record_property
    ON sierra_view.bib_view.id=sierra_view.bib_record_property.bib_record_id

    LEFT JOIN sierra_view.bib_record_item_record_link
    ON sierra_view.bib_view.id=sierra_view.bib_record_item_record_link.bib_record_id


    LEFT JOIN sierra_view.item_view
    ON sierra_view.bib_record_item_record_link.item_record_id=sierra_view.item_view.id



    WHERE
    bcode3 ='-'
    
    and substr(location_code,1,2) not like 'wd'
    and substr(location_code,1,2) not like 'td'
     and substr(location_code,1,2) not like 'wc'
   
    and bcode2='a'
    and item_status_code!='p'
    and item_status_code!='$'
    and item_status_code!='i'
    and item_status_code!='u'
    and item_status_code!='z'
    and item_status_code!='d'
    and item_status_code!='m'
    and item_status_code!='v'
    and item_status_code!='r'


    and item_view.record_creation_date_gmt >= (current_date-90)

    and copy_num='1'
    limit 100
    `;
  

  return client.query(sql, values);
}


function getNewlyAcquiredVideos(client, location = 'dvds') {
  let locationConditions = '';
  let locationCodeField = 'location_code';
  let values = [];
  

  let sql = '';

 

    sql = `
    SELECT DISTINCT  bib_view.record_num,
    best_title as title,
    best_author as author,
    location_code as location,
    bib_view.record_num as recordnum

    FROM sierra_view.bib_view

    LEFT JOIN sierra_view.bib_record_property
    ON sierra_view.bib_view.id=sierra_view.bib_record_property.bib_record_id

    LEFT JOIN sierra_view.bib_record_item_record_link
    ON sierra_view.bib_view.id=sierra_view.bib_record_item_record_link.bib_record_id

    LEFT JOIN sierra_view.item_view
    ON sierra_view.bib_record_item_record_link.item_record_id=sierra_view.item_view.id

    WHERE
    bcode3 ='-'
    and substr(location_code,1,2) not like 'wd'
    and substr(location_code,1,2) not like 'td'
    and substr(location_code,1,2) not like 'wc'
    and bcode2='g'
    and item_status_code!='p'
    and item_status_code!='$'
    and item_status_code!='i'
    and item_status_code!='u'
    and item_status_code!='z'
    and item_status_code!='d'
    and item_status_code!='m'
    and item_status_code!='v'
    and item_status_code!='r'
    and item_view.record_creation_date_gmt >= (current_date-90)

    and copy_num='1'
    
	--union 
	--SELECT DISTINCT  bib_view.record_num,
    --best_title as title,
    --best_author as author,
    --location_code as location,
    --bib_view.record_num as recordnum

    --FROM sierra_view.bib_view

    --LEFT JOIN sierra_view.bib_record_property
    --ON sierra_view.bib_view.id=sierra_view.bib_record_property.bib_record_id
	
	--LEFT JOIN sierra_view.bib_record_location
    --ON sierra_view.bib_view.id=sierra_view.bib_record_location.bib_record_id

    --WHERE
    --bcode3 ='-'
    --and location_code='ev'
    --and bcode2='g'
    --and cataloging_date_gmt >= (current_date-50)
  
  --  limit 100
    `;
  

  return client.query(sql, values);
}

function getNewlyAcquiredMusic(client, location = 'dvds') {
  let locationConditions = '';
  let locationCodeField = 'location_code';
  let values = [];
  

  let sql = '';

 

    sql = `
    SELECT DISTINCT  bib_view.record_num,
    best_title as title,
    best_author as author,
    location_code as location,
    bib_view.record_num as recordnum

    FROM sierra_view.bib_view

    LEFT JOIN sierra_view.bib_record_property
    ON sierra_view.bib_view.id=sierra_view.bib_record_property.bib_record_id

    LEFT JOIN sierra_view.bib_record_item_record_link
    ON sierra_view.bib_view.id=sierra_view.bib_record_item_record_link.bib_record_id


    LEFT JOIN sierra_view.item_view
    ON sierra_view.bib_record_item_record_link.item_record_id=sierra_view.item_view.id



    WHERE
    bcode3 ='-'
    
    and substr(location_code,1,2) not like 'wd'
    and substr(location_code,1,2) not like 'td'
     and substr(location_code,1,2) not like 'wc'
   
    and bcode2='j'
    and item_status_code!='p'
    and item_status_code!='$'
    and item_status_code!='i'
    and item_status_code!='u'
    and item_status_code!='z'
    and item_status_code!='d'
    and item_status_code!='m'
    and item_status_code!='v'
    and item_status_code!='r'


    and item_view.record_creation_date_gmt >= (current_date-90)

    and copy_num='1'
    limit 100
    `;
  

  return client.query(sql, values);
}



function getPopularItems(client, location = 'gen') {
  let locationConditions = '';
  let values = [];
  const genCondition = (location === 'gen') ? 'and checkout_total>100' : '';
  if (location === 'ebooks' || location === 'evideos') return [];

  switch (location) {
    case 'gen':
      locationConditions += 'and location_code like $1';
      values.push('wgi');
      break;
    case 'gov':
      locationConditions += `
      and (location_code like $1 OR
      location_code like $2 OR
      location_code like $3)
      `;
      values = ['wdn', 'wdu', 'wdd'];
      break;
    case 'juv':
      locationConditions += `
      and (location_code like $1 OR
      location_code like $2 OR
      location_code like $3 OR
      location_code like $4)
      `;
      values = ['wje', 'wjf', 'wjb', 'wjd'];
      break;
    case 'new':
      locationConditions += 'and location_code like $1';
      values.push('whi');
      break;
    case 'cds':
      locationConditions += 'and location_code like $1';
      values.push('wac');
      break;
    case 'dvds':
      locationConditions += `
      and (location_code like $1 OR
      location_code like $2)
      `;
      values = ['wadvr', 'wadvd'];
      break;
    case 'audiobooks':
      locationConditions += 'and location_code like $1';
      values.push('wrb');
      break;
    default:
      locationConditions += 'and location_code like $1';
      values.push('whi');
      break;
  }

  const sql = `
  SELECT DISTINCT  bib_view.record_num,checkout_total,
  best_title as title,
  best_author as author,
  location_code as location

  FROM sierra_view.bib_view

  LEFT JOIN sierra_view.bib_record_property
  ON sierra_view.bib_view.id=sierra_view.bib_record_property.bib_record_id

  LEFT JOIN sierra_view.bib_record_item_record_link
  ON sierra_view.bib_view.id=sierra_view.bib_record_item_record_link.bib_record_id

  LEFT JOIN sierra_view.item_view
  ON sierra_view.bib_record_item_record_link.item_record_id=sierra_view.item_view.id

  WHERE
  bcode3 ='-'

  ${locationConditions}

  and item_status_code!='p'
  and item_status_code!='$'
  and item_status_code!='i'
  and item_status_code!='u'
  and item_status_code!='z'
  and item_status_code!='d'
  and item_status_code!='m'
  and item_status_code!='v'
  and item_status_code!='r'

  and icode2='-'

  ${genCondition}

  and checkout_total > 10
  order by checkout_total DESC
  limit 36
  `;

  return client.query(sql, values);
}

module.exports = {
  getPopularItems,
  getNewlyAcquiredBooks,
  getNewlyAcquiredVideos,
  getNewlyAcquiredMusic,
  getISBN,
  getUPC,
  getAddInfo,
};
