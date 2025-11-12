<?php

defined('TYPO3') or die('Access denied.');

// Add default RTE configuration
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['site_package'] = 'EXT:site_package/Configuration/RTE/Default.yaml';

// Add page TSconfig
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig(
    '@import "EXT:site_package/Configuration/Sets/SitePackage/page.tsconfig"'
);

// Add TypoScript (setup)
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptSetup(
    '@import "EXT:site_package/Configuration/Sets/SitePackage/TypoScript/page.typoscript"'
);
