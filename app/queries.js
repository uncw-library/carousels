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

async function getAddInfo (sierra, bib) {
  const values = [bib]
  const sql = `
    SELECT is_available_at_library,
      call_number_norm as call_number,
      location_code,
      location_name.name as location
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

async function getNewBooks (sierra, location = 'gen') {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num,
      best_title as title,
      best_author as author,
      location_code as location,
      bib_view.record_num as recordnum
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

async function getNewVideos (sierra, location = 'dvds') {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num,
      best_title as title,
      best_author as author,
      location_code as location,
      bib_view.record_num as recordnum
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

function getNewMusic (sierra, location = 'dvds') {
  const sql = `
    SELECT DISTINCT
      bib_view.record_num,
      best_title as title,
      best_author as author,
      location_code as location,
      bib_view.record_num as recordnum
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
      AND item_view.record_creation_date_gmt >= (current_date-90)
      AND copy_num='1'
    LIMIT 100
  `
  return sierra.query(sql)
}

function getPopularItems (sierra, location = 'gen') {
  if (location === 'ebooks' || location === 'evideos') {
    return []
  }

  const genCondition = (location === 'gen') ? 'AND checkout_total>100' : ''

  const options = {
    gen: "'wgi'",
    gov: "'wdn', 'wdu', 'wdd'",
    juv: "'wje', 'wjf', 'wjb', 'wjd'",
    new: "'whi'",
    cds: "'wac'",
    dvds: "'wadvr', 'wadvd'",
    audiobooks: "'wrb'",
    default: "'whi'"
  }
  let locationString = options[location]
  if (!locationString) { locationString = options.default }

  const sql = `
    SELECT DISTINCT
      bib_view.record_num,checkout_total,
      best_title as title,
      best_author as author,
      location_code as location
    FROM sierra_view.bib_view
    LEFT JOIN sierra_view.bib_record_property
      ON sierra_view.bib_view.id = sierra_view.bib_record_property.bib_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.bib_view.id = sierra_view.bib_record_item_record_link.bib_record_id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.bib_record_item_record_link.item_record_id = sierra_view.item_view.id
    WHERE
      bcode3 = '-'
      AND location_code IN (${locationString})
      AND item_status_code NOT IN ('p', '$', 'i', 'u', 'z', 'd', 'm', 'v', 'r')
      AND icode2 = '-'
      ${genCondition}
      AND checkout_total > 10
    ORDER BY checkout_total DESC
    LIMIT 36
  `
  return sierra.query(sql)
}

module.exports = {
  getPopularItems,
  getNewBooks,
  getNewVideos,
  getNewMusic,
  getISBN,
  getUPC,
  getAddInfo
}
