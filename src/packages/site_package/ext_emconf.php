<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Studio Site Package',
    'description' => 'Desc',
    'category' => 'templates',
    'constraints' => [
        'depends' => [
            'typo3' => '13.4.0-13.4.99',
            'fluid_styled_content' => '13.4.0-13.4.99',
            'rte_ckeditor' => '13.4.0-13.4.99',
        ],
        'conflicts' => [
        ],
    ],
    'autoload' => [
        'psr-4' => [
            'Studio\\SitePackage\\' => 'Classes',
        ],
    ],
    'state' => 'stable',
    'uploadfolder' => 0,
    'createDirs' => '',
    'clearCacheOnLoad' => 1,
    'author' => 'Daniel Hackiewicz',
    'author_email' => 'dhackiewicz@gmail.com',
    'author_company' => 'Studio',
    'version' => '1.0.0',
];
