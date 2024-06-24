DECLARE
    compatible_scp_details json;
    overlap_record RECORD;
BEGIN
    RAISE NOTICE 'Starting function execution';
    
    WITH overlap AS (
        SELECT
            s2.id AS scp_id,
            s2.name,
            s2.whatsapp_phone_no AS phone,
            s2.timezone,
            sa2.date,
            TO_CHAR(GREATEST(sa1.start_time::time, sa2.start_time::time), 'HH24:MI') AS overlapping_start_time,
            TO_CHAR(LEAST(sa1.end_time::time, sa2.end_time::time), 'HH24:MI') AS overlapping_end_time
        FROM scp s1
        JOIN scp_availability sa1 ON s1.id = sa1.scp_id
        JOIN scp_availability sa2 ON sa1.date = sa2.date
        JOIN scp s2 ON sa2.scp_id = s2.id
        WHERE s1.id = given_scp_id
          AND s2.id <> s1.id
          AND s1.languages_spoken && s2.languages_spoken
          AND s1.services_offered && s2.services_offered
          AND GREATEST(sa1.start_time::time, sa2.start_time::time) < LEAST(sa1.end_time::time, sa2.end_time::time)
          AND (LEAST(sa1.end_time::time, sa2.end_time::time) - GREATEST(sa1.start_time::time, sa2.start_time::time)) >= INTERVAL '1 hour'
        LIMIT 1
    )
    SELECT
        scp_id,
        name,
        phone,
        timezone,
        date,
        overlapping_start_time,
        TO_CHAR(TO_TIMESTAMP(overlapping_start_time, 'HH24:MI') + INTERVAL '1 hour', 'HH24:MI') AS new_end_time
    INTO overlap_record
    FROM overlap;

    IF overlap_record.scp_id IS NULL THEN
        RAISE NOTICE 'No overlapping records found';
        RETURN NULL;
    END IF;

    RAISE NOTICE 'Overlap found: %, %, %, %, %, %', 
        overlap_record.scp_id, overlap_record.name, overlap_record.phone, overlap_record.date, overlap_record.overlapping_start_time, overlap_record.new_end_time;

    RETURN json_build_object(
        'scp_id', overlap_record.scp_id,
        'name', overlap_record.name,
        'phone', overlap_record.phone,
        'timezone', overlap_record.timezone,
        'date', overlap_record.date,
        'start_time', overlap_record.overlapping_start_time,
        'end_time', overlap_record.new_end_time
    );
END;