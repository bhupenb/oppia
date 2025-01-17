// Copyright 2017 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service to search explorations metadata.
 */

require('domain/utilities/url-interpolation.service.ts');
require('services/AlertsService.ts');

angular.module('oppia').factory('SearchExplorationsBackendApiService', [
  '$http', '$q', 'UrlInterpolationService',
  'SEARCH_EXPLORATION_URL_TEMPLATE',
  function(
      $http, $q, UrlInterpolationService,
      SEARCH_EXPLORATION_URL_TEMPLATE) {
    var _fetchExplorations = function(
        searchQuery, successCallback, errorCallback) {
      var queryUrl = UrlInterpolationService.interpolateUrl(
        SEARCH_EXPLORATION_URL_TEMPLATE, {
          query: btoa(searchQuery)
        }
      );
      $http.get(queryUrl).then(function(response) {
        successCallback(response.data);
      }, function(errorResponse) {
        errorCallback(errorResponse.data);
      });
    };
    return {
      /**
       * Returns exploration's metadata dict, given a search query. Search
       * queries are tokens that will be matched against exploration's title
       * and objective.
       */
      fetchExplorations: function(searchQuery) {
        return $q(function(resolve, reject) {
          _fetchExplorations(searchQuery, resolve, reject);
        });
      }
    };
  }]);
