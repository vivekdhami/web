﻿angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, passwordService, siteId, folders, $analytics) {
        $analytics.eventTrack('vaultEditSiteController', { category: 'Modal' });
        $scope.folders = folders;
        $scope.site = {};

        apiService.sites.get({ id: siteId }, function (site) {
            $scope.site = cipherService.decryptSite(site);
        });

        $scope.save = function (model) {
            var site = cipherService.encryptSite(model);
            $scope.savePromise = apiService.sites.put({ id: siteId }, site, function (siteResponse) {
                $analytics.eventTrack('Edited Site');
                var decSite = cipherService.decryptSite(siteResponse);
                $uibModalInstance.close({
                    action: 'edit',
                    data: decSite
                });
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.site.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Edit');
                $scope.site.password = passwordService.generatePassword({ length: 10, special: true });
            }
        };

        $scope.clipboardSuccess = function (e) {
            e.clearSelection();
            selectPassword(e);
        };

        $scope.clipboardError = function (e, password) {
            if (password) {
                selectPassword(e);
            }
            alert('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        $scope.folderSort = function (item) {
            return item.name.toLowerCase();
        };

        function selectPassword(e) {
            var target = $(e.trigger).parent().prev();
            if (target.attr('type') === 'text') {
                target.select();
            }
        }

        $scope.delete = function () {
            if (!confirm('Are you sure you want to delete this site (' + $scope.site.name + ')?')) {
                return;
            }

            apiService.sites.del({ id: $scope.site.id }, function () {
                $uibModalInstance.close({
                    action: 'delete',
                    data: $scope.site.id
                });
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
