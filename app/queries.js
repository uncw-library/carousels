async function getISBN (sierra, bib) {
  const values = [bib]
  const sql = `
    SELECT DISTINCT varfield_view.field_content
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.varfield_view
      ON sierra_view.varfield_view.record_id = sierra_view.bib_view.id
    WHERE
      marc_tag = '020'
      AND sierra_view.bib_view.record_num = $1
    LIMIT 1
  `
  return await sierra.query(sql, values)
}

async function getUPC (sierra, bib) {
  const values = [bib]
  const sql = `
    SELECT DISTINCT field_content
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.varfield_view
      ON sierra_view.varfield_view.record_id = sierra_view.bib_view.id
    WHERE
      marc_tag = '024'
      AND sierra_view.bib_view.record_num = $1
    limit 1
  `
  return await sierra.query(sql, values)
}

async function getExtras (sierra, bib) {
  const values = [bib]
  const sql = `
    SELECT is_available_at_library,
      call_number_norm as call_number,
      location_code,
      location_name.name as location_name
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    LEFT JOIN sierra_view.item_record_property
      ON sierra_view.item_record_property.item_record_id = sierra_view.item_view.id
    LEFT JOIN sierra_view.location
      ON sierra_view.location.code = item_view.location_code
    LEFT JOIN sierra_view.location_name
      ON sierra_view.location_name.location_id = location.id
    WHERE bib_view.record_num = $1
  `
  return await sierra.query(sql, values)
}

async function getNewBooks (sierra) {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      best_title as title,
      best_author as author,
      location_code
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_view.id = sierra_view.bib_record_property.bib_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    WHERE
      bcode3 = '-'
      AND substr(location_code,1,2) NOT IN ('wd', 'td', 'wc')
      AND bcode2 = 'a'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date-30)
      AND copy_num = '1'
    LIMIT 50
  `
  return await sierra.query(sql)
}

async function getNewVideos (sierra) {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      best_title as title,
      best_author as author,
      location_code
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_view.id = sierra_view.bib_record_property.bib_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    WHERE
      bcode3 = '-'
      AND substr(location_code,1,2) NOT IN ('wd', 'td', 'wc')
      AND bcode2 = 'g'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date-90)
      AND copy_num = '1'
  `
  return await sierra.query(sql)
}

async function getNewMusic (sierra) {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      best_title as title,
      best_author as author,
      location_code,
      item_view.record_creation_date_gmt as creation_date
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_view.id = sierra_view.bib_record_property.bib_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    WHERE
      bcode3 = '-'
      AND substr(location_code,1,2) NOT IN ('wd', 'td', 'wc')
      AND bcode2 = 'j'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND copy_num='1'
  ORDER BY creation_date DESC
  LIMIT 50
  `
  return await sierra.query(sql)
}

async function getUNCWAuthors (sierra) {
  const sql = `
    SELECT bib_view.record_num as recordnum,
      best_title_norm as title,
      best_author_norm as author
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.varfield_view
      ON sierra_view.varfield_view.record_id = sierra_view.bib_view.id
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_record_property.bib_record_id = sierra_view.bib_view.id
    WHERE 
      bcode3 = '-'
      AND marc_tag = '690'
      AND lower(field_content) = '|auncw faculty authors'
      AND varfield_view.record_type_code = 'b'
    ORDER BY best_author_norm desc
  `
  return await sierra.query(sql)
}

module.exports = {
  getNewBooks,
  getNewVideos,
  getNewMusic,
  getUNCWAuthors,
  getISBN,
  getUPC,
  getExtras
}
