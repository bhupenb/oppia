// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for the translation overview and changing
 * translation language.
 */

require('domain/utilities/LanguageUtilService.ts');
require('domain/utilities/url-interpolation.service.ts');
require(
  'pages/exploration-editor-page/translation-tab/services/' +
  'translation-language.service.ts');
require(
  'pages/exploration-editor-page/translation-tab/services/' +
  'translation-status.service.ts');

require(
  'pages/exploration-editor-page/exploration-editor-page.constants.ajs.ts');

angular.module('oppia').directive('translatorOverview', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        isTranslationTabBusy: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration-editor-page/translation-tab/translator-overview/' +
        'translator-overview.directive.html'),
      controller: [
        '$rootScope', '$scope', '$timeout', '$window',
        'ExplorationLanguageCodeService', 'LanguageUtilService',
        'TranslationLanguageService', 'TranslationStatusService',
        'TranslationTabActiveModeService', 'DEFAULT_AUDIO_LANGUAGE',
        'SUPPORTED_AUDIO_LANGUAGES', function(
            $rootScope, $scope, $timeout, $window,
            ExplorationLanguageCodeService, LanguageUtilService,
            TranslationLanguageService, TranslationStatusService,
            TranslationTabActiveModeService, DEFAULT_AUDIO_LANGUAGE,
            SUPPORTED_AUDIO_LANGUAGES) {
          var LAST_SELECTED_TRANSLATION_LANGUAGE = (
            'last_selected_translation_lang');
          var prevLanguageCode = $window.localStorage.getItem(
            LAST_SELECTED_TRANSLATION_LANGUAGE);
          var allAudioLanguageCodes = LanguageUtilService
            .getAllVoiceoverLanguageCodes();

          $scope.VOICEOVER_MODE = 'Voiceover';
          $scope.TRANSLATION_MODE = 'Translate';

          $scope.languageCode =
            allAudioLanguageCodes.indexOf(prevLanguageCode) !== -1 ?
              prevLanguageCode : DEFAULT_AUDIO_LANGUAGE;
          TranslationLanguageService.setActiveLanguageCode(
            $scope.languageCode);
          // We need to refresh the status service once the active language is
          // set.
          TranslationStatusService.refresh();
          $scope.inTranslationMode = false;
          $scope.inVoiceoverMode = false;
          $scope.canShowTabModeSwitcher = function() {
            return ($scope.languageCode !== (
              ExplorationLanguageCodeService.displayed));
          };

          var refreshDirectiveScope = function() {
            $scope.inTranslationMode = (
              TranslationTabActiveModeService.isTranslationModeActive());
            $scope.inVoiceoverMode = (
              TranslationTabActiveModeService.isVoiceoverModeActive());
            allAudioLanguageCodes = (
              LanguageUtilService.getAllVoiceoverLanguageCodes());
            if ($scope.inTranslationMode) {
              var index = allAudioLanguageCodes.indexOf(
                ExplorationLanguageCodeService.displayed);
              if (index !== -1) {
                allAudioLanguageCodes.splice(index, 1);
              }
            }
            $scope.languageCodesAndDescriptions = (
              allAudioLanguageCodes.map(function(languageCode) {
                return {
                  id: languageCode,
                  description: (
                    LanguageUtilService.getAudioLanguageDescription(
                      languageCode))
                };
              }));
          };

          $scope.changeActiveMode = function(modeName) {
            if (modeName === $scope.VOICEOVER_MODE) {
              TranslationTabActiveModeService.activateVoiceoverMode();
            } else if (modeName === $scope.TRANSLATION_MODE) {
              TranslationTabActiveModeService.activateTranslationMode();
            }
            refreshDirectiveScope();
            TranslationStatusService.refresh();
          };

          $scope.getTranslationProgressStyle = function() {
            $scope.numberOfRequiredAudio = TranslationStatusService
              .getExplorationContentRequiredCount();
            $scope.numberOfAudioNotAvailable = TranslationStatusService
              .getExplorationContentNotAvailableCount();
            var progressPercent = (
              100 - ($scope.numberOfAudioNotAvailable /
                $scope.numberOfRequiredAudio) * 100);
            return {width: progressPercent + '%'};
          };

          $scope.changeTranslationLanguage = function() {
            if ($scope.isTranslationTabBusy) {
              $scope.languageCode = $window.localStorage.getItem(
                LAST_SELECTED_TRANSLATION_LANGUAGE);
              $rootScope.$broadcast('showTranslationTabBusyModal');
              return;
            }
            TranslationLanguageService.setActiveLanguageCode(
              $scope.languageCode);
            TranslationStatusService.refresh();

            $window.localStorage.setItem(
              LAST_SELECTED_TRANSLATION_LANGUAGE, $scope.languageCode);
          };

          $scope.getTranslationProgressAriaLabel = function() {
            if ($scope.numberOfRequiredAudio -
              $scope.numberOfAudioNotAvailable === 1) {
              return (
                $scope.numberOfRequiredAudio -
                $scope.numberOfAudioNotAvailable + ' item translated out of ' +
                $scope.numberOfRequiredAudio + ' items');
            } else {
              return (
                $scope.numberOfRequiredAudio -
                $scope.numberOfAudioNotAvailable +
                ' items translated out of ' +
                $scope.numberOfRequiredAudio + ' items');
            }
          };

          refreshDirectiveScope();
        }
      ]
    };
  }]);
