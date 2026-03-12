CREATE TABLE session_observation (
    SESS_ID TEXT,
    REFOBS_ID TEXT
);
CREATE TABLE observation (
    REFOBS_ID TEXT,
    TYPE TEXT,
    REF_START_DATETIME TEXT,
    REF_END_DATETIME TEXT,
    ALONG_TRACK_TIME_OFFSET INTEGER,
    LSAR_SQUINT_TIME_OFFSET INTEGER,
    SSAR_SQUINT_TIME_OFFSET INTEGER,
    LSAR_JOINT_OP_TIME_OFFSET INTEGER,
    SSAR_JOINT_OP_TIME_OFFSET INTEGER,
    PRIORITY TEXT,
    CMD_LSAR_START_DATETIME TEXT,
    CMD_LSAR_END_DATETIME TEXT,
    CMD_SSAR_START_DATETIME TEXT,
    CMD_SSAR_END_DATETIME TEXT,
    LSAR_PATH TEXT,
    SSAR_PATH TEXT,
    LSAR_CONFIG_ID INTEGER,
    SSAR_CONFIG_ID INTEGER,
    DATATAKE_ID TEXT,
    SEGMENT_DATATAKE_ON_SSR TEXT,
    OBS_SUPPORT TEXT,
    INTRODUCED_IN TEXT
);
CREATE INDEX idx_session ON session_observation(SESS_ID);
CREATE INDEX idx_obsid ON session_observation(REFOBS_ID);
CREATE INDEX idx_observation_refo ON observation(REFOBS_ID);
CREATE INDEX idx_observation_ssarconfig ON observation(SSAR_CONFIG_ID);
CREATE INDEX idx_observation_cmdstart ON observation(CMD_SSAR_START_DATETIME);
CREATE INDEX idx_observation_cmdend ON observation(CMD_SSAR_END_DATETIME);
CREATE INDEX idx_observation_refstart ON observation(REF_START_DATETIME);
CREATE INDEX idx_observation_refend ON observation(REF_END_DATETIME);
CREATE TABLE `CRID_NISAR_INFO` (
  `environment` char(2) DEFAULT NULL
,  `phase` integer DEFAULT NULL
,  `major_release` integer DEFAULT NULL
,  `minor_release` integer DEFAULT NULL
,  `patch_release` integer DEFAULT NULL
,  `patch_date` timestamp NOT NULL DEFAULT current_timestamp 
,  `flag` char(1) DEFAULT NULL
);
CREATE TABLE `ERRORCODES` (
  `errorcode` integer NOT NULL
,  `message` varchar(256) DEFAULT NULL
);
CREATE TABLE `MW01_LOCAL_WO` (
  `pri` varchar(1) DEFAULT '0'
,  `sat` varchar(4) DEFAULT 'RI1'
,  `dop` varchar(8) DEFAULT '120324'
,  `sen` varchar(4) DEFAULT 'RI1'
,  `imode` varchar(1) DEFAULT '1'
,  `path` integer DEFAULT 0
,  `row1` integer DEFAULT 0
,  `sessionno` integer DEFAULT 0
,  `segmentno` varchar(255) DEFAULT NULL
,  `stripno` integer DEFAULT 0
,  `sceneno` integer DEFAULT 0
,  `sub` integer DEFAULT 0
,  `sectorno` integer DEFAULT 0
,  `orbit` integer DEFAULT 0
,  `img_orbit` integer DEFAULT 0
,  `pass_type` varchar(1) DEFAULT 'P'
,  `station` varchar(4) DEFAULT 'SAN'
,  `map` varchar(10) DEFAULT '56K06NW'
,  `map_extn` varchar(2) DEFAULT 'EA'
,  `datum` varchar(4) DEFAULT 'INDI'
,  `shift` integer DEFAULT 0
,  `node` varchar(1) DEFAULT 'A'
,  `bandno` integer DEFAULT 1
,  `coverage` varchar(1) DEFAULT 'P'
,  `pri_prod` integer DEFAULT NULL
,  `ptype` varchar(2) DEFAULT 'ST'
,  `proj` varchar(1) DEFAULT 'U'
,  `samp` varchar(1) DEFAULT 'C'
,  `enhan` varchar(2) DEFAULT '00'
,  `ilevel` varchar(1) DEFAULT 'G'
,  `iformat` varchar(1) DEFAULT 'T'
,  `isize` varchar(1) DEFAULT 'D'
,  `outres` float DEFAULT 1.1
,  `bgr` integer DEFAULT 0
,  `reqyr` integer DEFAULT 0
,  `reqno` integer DEFAULT 0
,  `pno` integer DEFAULT 0
,  `sno` integer DEFAULT 0
,  `setx` integer DEFAULT 0
,  `stat` integer DEFAULT 4
,  `qty` integer DEFAULT 0
,  `aoicount` integer DEFAULT 4
,  `activityid` varchar(4) DEFAULT ''
,  `nw_lat` float DEFAULT 0
,  `nw_lon` float DEFAULT 0
,  `ne_lat` float DEFAULT 0
,  `ne_lon` float DEFAULT 0
,  `sw_lat` float DEFAULT 0
,  `sw_lon` float DEFAULT 0
,  `se_lat` float DEFAULT 0
,  `se_lon` float DEFAULT 0
,  `center_lat` float DEFAULT 0
,  `center_lon` float DEFAULT 0
,  `ptype_us` varchar(2) DEFAULT 'ST'
,  `iproj` varchar(1) DEFAULT 'U'
,  `isamp` varchar(1) DEFAULT 'C'
,  `enhan_us` varchar(2) DEFAULT '00'
,  `ilevel_us` varchar(1) DEFAULT 'G'
,  `iformat_us` varchar(1) DEFAULT 'T'
,  `isize_us` varchar(1) DEFAULT 'D'
,  `input_id` varchar(2) DEFAULT '1'
,  `input_no` integer DEFAULT 0
,  `archmedia_id` varchar(255) DEFAULT NULL
,  `archmedia_no` integer DEFAULT 2
,  `otsprodid` varchar(255) DEFAULT NULL
,  `vads_flag` varchar(1) DEFAULT 'F'
,  `adif_regen_flag` varchar(1) DEFAULT 'F'
,  `mask_flag` varchar(1) DEFAULT 'F'
,  `orderflag` varchar(1) DEFAULT 'F'
,  `irqc_flag` varchar(1) DEFAULT 'F'
,  `archive_flag` varchar(1) DEFAULT 'F'
,  `mosaic_flag` varchar(1) DEFAULT 'F'
,  `aoipackflag` varchar(1) DEFAULT 'F'
,  `ftp_flag` varchar(1) DEFAULT 'F'
,  `genprod_with_proc_spec` varchar(50) DEFAULT ''
,  `media_vol` integer DEFAULT 0
,  `media_id` varchar(2) DEFAULT ''
,  `media_no` integer DEFAULT 0
,  `rol` integer DEFAULT 0
,  `bat` integer DEFAULT 0
,  `frame` integer DEFAULT 0
,  `fire_system` varchar(1024) DEFAULT NULL
,  `procnodeqin` timestamp NOT NULL DEFAULT current_timestamp
,  `procnodein` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
,  `procnodeout` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
,  `wc` varchar(4) DEFAULT 'DPS'
,  `proc_system` varchar(4) DEFAULT 'MW01'
,  `reasons` varchar(4) DEFAULT ''
,  `rejprocname` varchar(20) DEFAULT ''
,  `logfilename` varchar(200) DEFAULT NULL
,  `wc_counter` integer DEFAULT 20
,  `remarks` varchar(30) DEFAULT ''
,  `annot` varchar(15) DEFAULT ''
,  `imsuse` varchar(15) DEFAULT ''
,  `specklefilter_flag` varchar(1) DEFAULT 'F'
,  `transpol` varchar(1) DEFAULT 'V'
,  `recvpol` varchar(1) DEFAULT 'V'
);
CREATE TABLE `NISAR_IMAGING_DATA` (
  `MASTERWOID` varchar(255) DEFAULT NULL
,  `revision_no` integer DEFAULT NULL
,  `FIRE_SYSTEM` varchar(512) DEFAULT NULL
,  `MODE` char(1) DEFAULT NULL
);
CREATE TABLE `NISAR_PRODUCT_INFO` (
  `workorder_id` varchar(255) DEFAULT NULL
,  `scenecenterlat` float DEFAULT NULL
,  `scenecenterlon` float DEFAULT NULL
,  `scenecenterpitch` float DEFAULT NULL
,  `scenecenterroll` float DEFAULT NULL
,  `scenecenteryaw` float DEFAULT NULL
);
CREATE TABLE `NISAR_REPLICA_DATA` (
  `MASTERWOID` varchar(255) DEFAULT NULL
,  `revision_no` integer DEFAULT NULL
,  `FIRE_SYSTEM` varchar(512) DEFAULT NULL
);
CREATE TABLE `NISAR_WO_TIMEOUT` (
  `reqyr` integer DEFAULT NULL
,  `reqno` integer DEFAULT NULL
,  `pno` integer DEFAULT NULL
,  `sno` integer DEFAULT NULL
,  `trackno` integer DEFAULT NULL
,  `frameno` integer DEFAULT NULL
,  `media_no` integer DEFAULT NULL
,  `orbit` integer DEFAULT NULL
,  `img_orbit` integer DEFAULT NULL
,  `dop` integer DEFAULT NULL
,  `input_no` integer DEFAULT NULL
,  `ilevel` varchar(10) DEFAULT NULL
,  `input_id` varchar(10) DEFAULT NULL
,  `enhan` varchar(10) DEFAULT NULL
,  `sen` varchar(10) DEFAULT NULL
,  `procnodeqin` varchar(255) DEFAULT NULL
,  `insertiontime` timestamp NOT NULL DEFAULT current_timestamp 
,  `segmentno` varchar(255) DEFAULT NULL
);
CREATE TABLE `PRODUCTINFONISAR` (
  `workorder_id` varchar(255) DEFAULT NULL
,  `start_time` varchar(34) DEFAULT NULL
,  `end_time` varchar(34) DEFAULT NULL
,  `status` integer DEFAULT NULL
,  `status_str` varchar(500) DEFAULT NULL
,  `revision_number` integer NOT NULL DEFAULT 0
,  `message` varchar(500) DEFAULT NULL
,  `BDH_status` varchar(500) DEFAULT NULL
,  `nodename` varchar(20) DEFAULT NULL
,  `sat_id` varchar(3) DEFAULT NULL
,  `prod_start_time` varchar(34) DEFAULT NULL
,  `prod_end_time` varchar(34) DEFAULT NULL
,  `prod_name` varchar(34) DEFAULT NULL
,  `OTSID` varchar(256) DEFAULT NULL
);
CREATE TABLE `PRODUCTMETAINFONISAR` (
  `workorder_id` varchar(255) DEFAULT NULL
,  `stripno` integer DEFAULT NULL
,  `sceneno` integer DEFAULT 1
,  `orbit` integer DEFAULT 0
,  `img_orbit` integer DEFAULT 0
,  `imode` varchar(1) DEFAULT '1'
,  `station` varchar(4) DEFAULT 'SAN'
,  `dop` varchar(8) DEFAULT '120324'
,  `ilevel` varchar(1) DEFAULT '0'
,  `sat_id` varchar(3) DEFAULT NULL
,  `revision_number` integer DEFAULT NULL
,  `orbit_fidelity` varchar(10) DEFAULT NULL
,  `CONFIGID` integer DEFAULT NULL
,  `SSARSESSIONID` varchar(255) DEFAULT NULL
,  `DATATAKEID` varchar(255) DEFAULT NULL
,  `OBSERVATIONID` varchar(25) DEFAULT NULL
,  `CYCLENO` integer DEFAULT NULL
,  `TRACKNO` integer DEFAULT NULL
,  `FRAMENO` integer DEFAULT NULL
,  `sessionid` varchar(255) DEFAULT NULL
,  `cridid` varchar(30) DEFAULT NULL
,  `SCENE_COVERAGE` varchar(10) DEFAULT NULL
,  `PRODUCT_COUNTER` integer DEFAULT NULL
,  `MASTERWOID` varchar(255) DEFAULT NULL
,  `scenestarttime` varchar(34) DEFAULT NULL
,  `sceneendtime` varchar(34) DEFAULT NULL
,  `SEN` varchar(2) DEFAULT NULL
,  `FIRE_SYSTEM` varchar(1000) DEFAULT NULL
);
CREATE TABLE `QA_NISAR_INFO` (
  `workorder_id` varchar(256) DEFAULT NULL
,  `starttime` decimal(10,0) DEFAULT NULL
,  `endtime` decimal(10,0) DEFAULT NULL
,  `prod_name` varchar(10) DEFAULT NULL
,  `revision_no` integer DEFAULT NULL
);
CREATE TABLE `SCHEDULERINGESTNISAR` (
  `imode` varchar(1) DEFAULT NULL
,  `ilevel` varchar(1) DEFAULT NULL
,  `validFlag` char(1) DEFAULT NULL
,  `sat_id` varchar(3) NOT NULL DEFAULT ''
,  `dumpingOrbit` integer DEFAULT NULL
,  `procnodeqin` varchar(200) DEFAULT NULL
,  `reqyr` integer DEFAULT NULL
,  `reqno` integer DEFAULT NULL
,  `pno` integer DEFAULT NULL
,  `sno` integer DEFAULT NULL
,  `segment_no` double DEFAULT NULL
,  `scene_no` integer DEFAULT NULL
,  `workorder_id` varchar(255) NOT NULL
,  `ingesttime` timestamp NOT NULL DEFAULT current_timestamp 
,  `IMODEDESC` varchar(255) DEFAULT NULL
,  `ILEVELDESC` varchar(255) DEFAULT NULL
,  `prodtype` varchar(10) DEFAULT NULL
,  `enhan` varchar(10) DEFAULT NULL
,  `nproduct` integer DEFAULT NULL
,  PRIMARY KEY (`workorder_id`,`sat_id`)
);
CREATE TABLE `WO_COUNTER_TRACK_INFO` (
  `woid` varchar(255) DEFAULT NULL
,  `cycleno` integer DEFAULT NULL
,  `trackno` integer DEFAULT NULL
,  `frameno` integer DEFAULT NULL
,  `orbit` integer DEFAULT NULL
,  `environment` char(2) DEFAULT NULL
,  `phase` char(2) DEFAULT NULL
,  `major_release` char(4) DEFAULT NULL
,  `minor_release` char(2) DEFAULT NULL
,  `patch_release` char(2) DEFAULT NULL
,  `orbitfidelity` varchar(10) DEFAULT NULL
,  `coverage` char(2) DEFAULT NULL
,  `counter` integer DEFAULT NULL
,  `prodType` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_RSLC` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_GSLC` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_GCOV` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_RIFG` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_RUNW` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_GUNW` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_ROFF` varchar(10) DEFAULT NULL
,  `PRODUCT_VERSION_GOFF` varchar(10) DEFAULT NULL
,  `PRODUCTSPEC_VERSION` varchar(10) DEFAULT NULL
,  `observationid` varchar(255) DEFAULT NULL
);
CREATE TABLE `WO_NIS_INFO` (
  `workorder_id` varchar(255) DEFAULT NULL
,  `sat_id` varchar(3) DEFAULT NULL
,  `revision_number` integer DEFAULT NULL
,  `sno` integer DEFAULT NULL
,  `pid` integer DEFAULT NULL
,  `proc_name` varchar(255) DEFAULT NULL
,  `start_time` varchar(34) DEFAULT NULL
,  `end_time` varchar(34) DEFAULT NULL
,  `cores` integer DEFAULT NULL
,  `host_name` varchar(15) DEFAULT NULL
,  `gpu_req` varchar(2) DEFAULT NULL
);
CREATE INDEX "idx_PRODUCTMETAINFONISAR_master_fkeyRI1" ON "PRODUCTMETAINFONISAR" (`workorder_id`);
CREATE TABLE `NISAR_L2` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `absoluteOrbitNumber` integer DEFAULT NULL
,  `boundingPolygon` text DEFAULT NULL
,  `diagnosticModeFlag` integer DEFAULT NULL
,  `frameNumber` integer DEFAULT NULL
,  `granuleId` text DEFAULT NULL
,  `instrumentName` text DEFAULT NULL
,  `isDithered` text DEFAULT NULL
,  `isGeocoded` text DEFAULT NULL
,  `isMixedMode` text DEFAULT NULL
,  `isUrgentObservation` text DEFAULT NULL
,  `listOfFrequencies` text DEFAULT NULL
,  `lookDirection` text DEFAULT NULL
,  `missionId` text DEFAULT NULL
,  `orbitPassDirection` text DEFAULT NULL
,  `plannedDatatakeId` text DEFAULT NULL
,  `plannedObservationId` text DEFAULT NULL
,  `processingCenter` text DEFAULT NULL
,  `processingDateTime` datetime DEFAULT NULL
,  `processingType` text DEFAULT NULL
,  `productLevel` text DEFAULT NULL
,  `productSpecificationVersion` text DEFAULT NULL
,  `productType` text DEFAULT NULL
,  `productVersion` text DEFAULT NULL
,  `radarBand` text DEFAULT NULL
,  `trackNumber` integer DEFAULT NULL
,  `zeroDopplerEndTime` datetime DEFAULT NULL
,  `zeroDopplerStartTime` datetime DEFAULT NULL
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE `cop_imaging_details` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `refobs_id` varchar(255) NOT NULL
,  `datatake_id` varchar(255) NOT NULL
,  `observation_id` varchar(255) NOT NULL
,  `ref_first_obs_time` datetime NOT NULL
,  `ref_last_obs_endtime` datetime NOT NULL
,  `duration` float NOT NULL
,  `dop` varchar(20) NOT NULL
,  `config_id` integer NOT NULL
,  `session_id` varchar(255) DEFAULT NULL
,  `obs_count` integer DEFAULT NULL
,  `satellite_longitude_start` float DEFAULT NULL
,  `satellite_latitude_start` float DEFAULT NULL
,  `satellite_height_start` float DEFAULT NULL
,  `satellite_longitude_end` float DEFAULT NULL
,  `satellite_latitude_end` float DEFAULT NULL
,  `satellite_height_end` float DEFAULT NULL
,  `target` varchar(100) DEFAULT NULL
,  `mode` varchar(100) DEFAULT NULL
,  `prf` varchar(20) DEFAULT NULL
,  `polarization_s` varchar(10) DEFAULT NULL
,  `bandwidth_s` float DEFAULT NULL
,  `pulsewidth_s` float DEFAULT NULL
,  `polarization_l` varchar(10) DEFAULT NULL
,  `bandwidth_l` varchar(10) DEFAULT NULL
,  `pulsewidth_l` float DEFAULT NULL
,  `cop_generation_time` datetime NOT NULL
,  `tle_generation_time` varchar(50) NOT NULL
,  `geometry_wkt` text DEFAULT NULL
,  `bounds_json` text DEFAULT NULL
,  `created_at` datetime DEFAULT NULL
,  `updated_at` datetime DEFAULT NULL
);
CREATE TABLE `cop_observation` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `file_id` integer NOT NULL
,  `refobs_id` varchar(255) NOT NULL
,  `obs_type` varchar(50) DEFAULT NULL
,  `priority` varchar(20) DEFAULT NULL
,  `ref_start_datetime` datetime DEFAULT NULL
,  `ref_end_datetime` datetime DEFAULT NULL
,  `lsar_config_id` varchar(255) DEFAULT NULL
,  `cmd_lsar_start_datetime` datetime DEFAULT NULL
,  `cmd_lsar_end_datetime` datetime DEFAULT NULL
,  `ssar_config_id` varchar(255) DEFAULT NULL
,  `cmd_ssar_start_datetime` datetime DEFAULT NULL
,  `cmd_ssar_end_datetime` datetime DEFAULT NULL
,  `datatake_id` varchar(255) DEFAULT NULL
,  `lob_status` varchar(50) DEFAULT 'Not Completed'
,  `adif_status` varchar(50) DEFAULT 'Not Completed'
,  `num_scenes` integer DEFAULT NULL
,  `img_cal_type` varchar(50) DEFAULT NULL
,  `dumping_orbit` integer DEFAULT NULL
,  `imaging_orbit` integer DEFAULT NULL
,  `strip_number` integer DEFAULT NULL
,  `modified_date` datetime NOT NULL DEFAULT current_timestamp 
,  UNIQUE (`refobs_id`)
,  CONSTRAINT `cop_observation_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `processed_files` (`id`) ON DELETE CASCADE
);
CREATE TABLE `dumping_table` (
  `obsid` varchar(255) NOT NULL
,  `ssid` varchar(255) NOT NULL
,  `dtid` varchar(255) NOT NULL
,  PRIMARY KEY (`obsid`,`ssid`,`dtid`)
);
CREATE TABLE `lobinfo` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `absoluteOrbitNumber` text DEFAULT NULL
,  `boundingPolygon` text DEFAULT NULL
,  `diagnosticModeFlag` text DEFAULT NULL
,  `granuleId` text DEFAULT NULL
,  `instrumentName` text DEFAULT NULL
,  `isDithered` text DEFAULT NULL
,  `isGeocoded` text DEFAULT NULL
,  `isJointObservation` text DEFAULT NULL
,  `isMixedMode` text DEFAULT NULL
,  `isUrgentObservation` text DEFAULT NULL
,  `listOfFrequencies` text DEFAULT NULL
,  `lookDirection` text DEFAULT NULL
,  `missionId` text DEFAULT NULL
,  `orbitPassDirection` text DEFAULT NULL
,  `plannedDatatakeId` text DEFAULT NULL
,  `plannedObservationId` text DEFAULT NULL
,  `platformName` text DEFAULT NULL
,  `processingCenter` text DEFAULT NULL
,  `processingDateTime` text DEFAULT NULL
,  `processingType` text DEFAULT NULL
,  `productLevel` text DEFAULT NULL
,  `productSpecificationVersion` text DEFAULT NULL
,  `productType` text DEFAULT NULL
,  `productVersion` text DEFAULT NULL
,  `radarBand` text DEFAULT NULL
,  `zeroDopplerEndTime` text DEFAULT NULL
,  `zeroDopplerStartTime` text DEFAULT NULL
);
CREATE TABLE `nisar_corner_reflectors` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `cr_name` varchar(255) NOT NULL
,  `cr_id` varchar(100) DEFAULT NULL
,  `latitude` float NOT NULL
,  `longitude` float NOT NULL
,  `height` float NOT NULL
,  `azimuth` float NOT NULL
,  `elevation` float NOT NULL
,  `trihedral_elevation` float NOT NULL
,  `dihedral_elevation` float NOT NULL
,  `slant_range` float NOT NULL
,  `closest_approach` datetime NOT NULL
,  `refobs_id` varchar(255) NOT NULL
,  `observation_id` varchar(255) NOT NULL
,  `datatake_id` varchar(255) NOT NULL
,  `ref_first_obs_time` datetime NOT NULL
,  `ref_last_obs_endtime` datetime NOT NULL
,  `cop_generation_time` datetime NOT NULL
,  `tle_generation_time` varchar(50) NOT NULL
,  `created_at` datetime DEFAULT NULL
,  `updated_at` datetime DEFAULT NULL
);
CREATE TABLE `processed_files` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `file_path` varchar(1024) NOT NULL
,  `valid_from_ref_datetime` datetime DEFAULT NULL
,  `valid_until_ref_datetime` datetime DEFAULT NULL
,  `processed_at` timestamp NOT NULL DEFAULT current_timestamp
,  UNIQUE (`file_path`)
);
CREATE TABLE `scene` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `observation_id` varchar(255) NOT NULL
,  `file_path` varchar(1024) DEFAULT NULL
,  `parsed_at` timestamp NOT NULL DEFAULT current_timestamp
,  `record_type_hdr` varchar(50) DEFAULT NULL
,  `dumping_orbit_num` integer DEFAULT NULL
,  `imaging_orbit_num` integer DEFAULT NULL
,  `imaging_node` varchar(50) DEFAULT NULL
,  `transmit_polarization` varchar(50) DEFAULT NULL
,  `receive_polarization` varchar(50) DEFAULT NULL
,  `baq_mode` varchar(50) DEFAULT NULL
,  `num_records_in_scene` integer DEFAULT NULL
,  `track` integer DEFAULT NULL
,  `frame` integer DEFAULT NULL
,  `cycle_number` integer DEFAULT NULL
,  `corner1_lat` decimal(10,6) DEFAULT NULL
,  `corner1_lon` decimal(10,6) DEFAULT NULL
,  `corner2_lat` decimal(10,6) DEFAULT NULL
,  `corner2_lon` decimal(10,6) DEFAULT NULL
,  `corner3_lat` decimal(10,6) DEFAULT NULL
,  `corner3_lon` decimal(10,6) DEFAULT NULL
,  `corner4_lat` decimal(10,6) DEFAULT NULL
,  `corner4_lon` decimal(10,6) DEFAULT NULL
,  `scene_center_lat` decimal(10,6) DEFAULT NULL
,  `scene_center_lon` decimal(10,6) DEFAULT NULL
,  `scene_start_time` datetime(6) DEFAULT NULL
,  `scene_end_time` datetime(6) DEFAULT NULL
,  `produceRIFG_flag` integer DEFAULT 0
,  `produceRIFG_workorder_id` varchar(255) DEFAULT NULL
,  `produceRIFG_Gen_status` varchar(100) DEFAULT NULL
,  `produceRIFG_error_msg` varchar(255) DEFAULT NULL
,  `produceRUNW_flag` integer DEFAULT 0
,  `produceRUNW_workorder_id` varchar(255) DEFAULT NULL
,  `produceRUNW_Gen_status` varchar(100) DEFAULT NULL
,  `produceRUNW_error_msg` varchar(255) DEFAULT NULL
,  `produceROFF_flag` integer DEFAULT 0
,  `produceROFF_workorder_id` varchar(255) DEFAULT NULL
,  `produceROFF_Gen_status` varchar(100) DEFAULT NULL
,  `produceROFF_error_msg` varchar(255) DEFAULT NULL
,  `produceGUNW_flag` integer DEFAULT 0
,  `produceGUNW_workorder_id` varchar(255) DEFAULT NULL
,  `produceGUNW_Gen_status` varchar(100) DEFAULT NULL
,  `produceGUNW_error_msg` varchar(255) DEFAULT NULL
,  `produceGOFF_flag` integer DEFAULT 0
,  `produceGOFF_workorder_id` varchar(255) DEFAULT NULL
,  `produceGOFF_Gen_status` varchar(100) DEFAULT NULL
,  `produceGOFF_error_msg` varchar(255) DEFAULT NULL
,  `produceRSLC_flag` integer DEFAULT 0
,  `produceRSLC_workorder_id` varchar(255) DEFAULT NULL
,  `produceRSLC_Gen_status` varchar(100) DEFAULT NULL
,  `produceRSLC_error_msg` varchar(255) DEFAULT NULL
,  `produceGSLC_flag` integer DEFAULT 0
,  `produceGSLC_workorder_id` varchar(255) DEFAULT NULL
,  `produceGSLC_Gen_status` varchar(100) DEFAULT NULL
,  `produceGSLC_error_msg` varchar(255) DEFAULT NULL
,  `produceGCOV_flag` integer DEFAULT 0
,  `produceGCOV_workorder_id` varchar(255) DEFAULT NULL
,  `produceGCOV_Gen_status` varchar(100) DEFAULT NULL
,  `produceGCOV_error_msg` varchar(255) DEFAULT NULL
,  `orbit_fidelty` varchar(255) DEFAULT NULL
,  `crid_id` varchar(255) DEFAULT NULL
,  `scene_no` varchar(255) DEFAULT NULL
,  `Master_wid` varchar(255) DEFAULT NULL
,  `gen_time` datetime DEFAULT NULL
,  `orbit_fidelty_prod` varchar(10) DEFAULT NULL
,  `produceRIFG_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceRIFG_LGen_status` varchar(50) DEFAULT NULL
,  `produceRIFG_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceRUNW_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceRUNW_LGen_status` varchar(50) DEFAULT NULL
,  `produceRUNW_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceROFF_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceROFF_LGen_status` varchar(50) DEFAULT NULL
,  `produceROFF_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceGUNW_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceGUNW_LGen_status` varchar(50) DEFAULT NULL
,  `produceGUNW_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceGOFF_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceGOFF_LGen_status` varchar(50) DEFAULT NULL
,  `produceGOFF_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceRSLC_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceRSLC_LGen_status` varchar(50) DEFAULT NULL
,  `produceRSLC_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceGSLC_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceGSLC_LGen_status` varchar(50) DEFAULT NULL
,  `produceGSLC_Lerror_msg` varchar(255) DEFAULT NULL
,  `produceGCOV_Lworkorder_id` varchar(50) DEFAULT NULL
,  `produceGCOV_LGen_status` varchar(50) DEFAULT NULL
,  `produceGCOV_Lerror_msg` varchar(255) DEFAULT NULL
,  `Lgen_time` datetime DEFAULT NULL
,  UNIQUE (`observation_id`,`track`,`frame`)
);
CREATE TABLE `strip` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `observation_id` varchar(255) NOT NULL
,  `file_path` varchar(1024) DEFAULT NULL
,  `parsed_at` timestamp NOT NULL DEFAULT current_timestamp
,  `record_type_hdr` varchar(50) DEFAULT NULL
,  `emergency_flag` varchar(50) DEFAULT NULL
,  `orbit_source_id` varchar(50) DEFAULT NULL
,  `strip_id` varchar(50) DEFAULT NULL
,  `config_id` varchar(50) DEFAULT NULL
,  `datatake_id` varchar(50) DEFAULT NULL
,  `num_scene_blocks` integer DEFAULT NULL
,  `strip_start_time` datetime(6) DEFAULT NULL
,  `strip_end_time` datetime(6) DEFAULT NULL
,  UNIQUE (`observation_id`,`datatake_id`)
);
CREATE INDEX "idx_nisar_corner_reflectors_ix_nisar_corner_reflectors_refobs_id" ON "nisar_corner_reflectors" (`refobs_id`);
CREATE INDEX "idx_strip_obs_id_idx" ON "strip" (`observation_id`);
CREATE INDEX "idx_scene_obs_id_idx" ON "scene" (`observation_id`);
CREATE INDEX "idx_cop_observation_file_id" ON "cop_observation" (`file_id`);
CREATE INDEX "idx_cop_imaging_details_ix_cop_imaging_details_refobs_id" ON "cop_imaging_details" (`refobs_id`);
CREATE INDEX "idx_cop_imaging_details_ix_cop_imaging_details_observation_id" ON "cop_imaging_details" (`observation_id`);