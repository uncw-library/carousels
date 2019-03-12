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
  SELECT item_status_code,call_number_norm as call_number,location_code, location_name.name as location
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

function getNewlyAcquiredItems(client, location = 'new') {
  let locationConditions = '';
  let locationCodeField = 'location_code';
  let values = [];
  let days = (location === 'gen' || location === 'gov') ? '10' : '180';
  days = (location === 'evideos' || location === 'ebooks') ? '90' : days;
  if (location === 'audiobooks') return [];

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
    case 'ebooks':
      locationConditions += 'and bib_record_location.location_code like $1';
      locationCodeField = 'bib_record_location.location_code';
      values.push('eb');
      break;
    case 'evideos':
      locationConditions += 'and bib_record_location.location_code like $1';
      locationCodeField = 'bib_record_location.location_code';
      values.push('ev');
      break;
    default:
      locationConditions += 'and location_code like $1';
      values.push('whi');
      break;
  }

  let sql = '';

  if (location === 'ebooks' || location === 'evideos') {
    sql = `
    SELECT DISTINCT  bib_view.record_num,
    best_title as title,
    best_author as author,
    ${locationCodeField} as location

    FROM sierra_view.bib_view

    LEFT JOIN sierra_view.bib_record_property
    ON sierra_view.bib_view.id=sierra_view.bib_record_property.bib_record_id

    LEFT JOIN sierra_view.bib_record_item_record_link
    ON sierra_view.bib_view.id=sierra_view.bib_record_item_record_link.bib_record_id


    LEFT JOIN sierra_view.item_view
    ON sierra_view.bib_record_item_record_link.item_record_id=sierra_view.item_view.id

    LEFT JOIN sierra_view.bib_record_location
    ON sierra_view.bib_view.id=sierra_view.bib_record_location.bib_record_id

    WHERE
    bcode3 ='-'

    ${locationConditions}

    and bib_view.record_creation_date_gmt >= (current_date-${days})
    limit 100
    `;
  } else {
    sql = `
    SELECT DISTINCT  bib_view.record_num,
    best_title as title,
    best_author as author,
    ${locationCodeField} as location

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


    and item_view.record_creation_date_gmt >= (current_date-${days})

    and copy_num='1'
    limit 100
    `;
  }

  return client.query(sql, values);
}

function getPopularItems(client, location = 'new') {
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
  getNewlyAcquiredItems,
  getISBN,
  getUPC,
  getAddInfo,
};
