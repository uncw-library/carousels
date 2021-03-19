const sierraPool = require('./sierraPool')

async function getISBN (bib) {
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
  return await sierraPool.query(sql, values)
}

async function getUPC (bib) {
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
  return await sierraPool.query(sql, values)
}

async function getExtras (bib) {
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
  return await sierraPool.query(sql, values)
}

async function getNewBooks () {
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
      AND item_view.record_creation_date_gmt >= (current_date - 30)
      AND copy_num = '1'
    LIMIT 50
  `
  return await sierraPool.query(sql)
}

async function getNewVideos () {
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
      AND item_view.record_creation_date_gmt >= (current_date - 90)
      AND copy_num = '1'
  `
  return await sierraPool.query(sql)
}

async function getNewMusic () {
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
      AND copy_num = '1'
  ORDER BY creation_date DESC
  LIMIT 50
  `
  return await sierraPool.query(sql)
}

async function getUNCWAuthors () {
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
  return await sierraPool.query(sql)
}

async function getNewGeneral () {
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
      AND location_code = 'wgi'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date - 10)
      AND copy_num = '1'
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewGov () {
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
      AND location_code IN ('wdn', 'wdu', 'wdd')
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date - 10)
      AND copy_num = '1'
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewJuv () {
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
      AND location_code IN ('wje', 'wjf', 'wjb', 'wjd')
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date - 180)
      AND copy_num = '1'
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewNew () {
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
      AND location_code = 'whi'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date - 180)
      AND copy_num = '1'
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewCDs () {
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
      AND location_code = 'wac'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date - 180)
      AND copy_num = '1'
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewDVDs () {
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
      AND location_code IN ('wadvr', 'wadvd')
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND item_view.record_creation_date_gmt >= (current_date - 180)
      AND copy_num = '1'
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewEbooks () {
  const sql = `
    SELECT DISTINCT 
      bib_view.record_num as recordnum,
      best_title as title,
      best_author as author,
      ltrim(substr(field_content, strpos(field_content,'|u')+2,9999)) as url,
      bib_record_location.location_code
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_view.id = sierra_view.bib_record_property.bib_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    LEFT JOIN sierra_view.bib_record_location
      ON sierra_view.bib_view.id = sierra_view.bib_record_location.bib_record_id
    LEFT JOIN sierra_view.varfield_view
      ON sierra_view.varfield_view.record_id = sierra_view.bib_view.id
    WHERE
      bcode3 = '-'
      AND marc_tag = '856'
      AND bib_record_location.location_code = 'eb'
      AND bib_view.record_creation_date_gmt >= (current_date - 90)
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getNewEvideos () {
  const sql = `
    SELECT DISTINCT 
      bib_view.record_num as recordnum,
      best_title as title,
      best_author as author,
      ltrim(substr(field_content, strpos(field_content,'|u')+2,9999)) as url,
      bib_record_location.location_code
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_view.id = sierra_view.bib_record_property.bib_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    LEFT JOIN sierra_view.bib_record_location
      ON sierra_view.bib_view.id = sierra_view.bib_record_location.bib_record_id
    LEFT JOIN sierra_view.varfield_view
      ON sierra_view.varfield_view.record_id = sierra_view.bib_view.id
    WHERE
      bcode3 = '-'
      AND marc_tag = '856'
      AND bib_record_location.location_code = 'ev'
      AND bib_view.record_creation_date_gmt >= (current_date - 90)
    LIMIT 100
  `
  return await sierraPool.query(sql)
}

async function getPopGeneral () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      AND location_code = 'wgi'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 100
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

async function getPopGov () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      AND location_code IN ('wdn', 'wdu', 'wdd')
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

async function getPopJuv () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      AND location_code IN ('wje', 'wjf', 'wjb', 'wjd')
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

async function getPopNew () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      WHERE bcode3 = '-'
      AND location_code = 'whi'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

async function getPopCDs () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      AND location_code = 'wac'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

async function getPopDVDs () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      AND location_code IN ('wadvr', 'wadvd')
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

async function getPopAudiobooks () {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num as recordnum,
      checkout_total,
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
      AND location_code = 'whi'
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return await sierraPool.query(sql)
}

module.exports = {
  getNewBooks,
  getNewVideos,
  getNewMusic,
  getUNCWAuthors,
  getISBN,
  getUPC,
  getExtras,
  getNewGeneral,
  getNewGov,
  getNewJuv,
  getNewNew,
  getNewCDs,
  getNewDVDs,
  getNewEbooks,
  getNewEvideos,
  getPopGeneral,
  getPopGov,
  getPopJuv,
  getPopNew,
  getPopCDs,
  getPopDVDs,
  getPopAudiobooks
}
