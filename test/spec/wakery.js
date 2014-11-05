describe('Wakery', function () {
    var $compile;
    var $rootScope;

    beforeEach(module('wakery'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('True is true', function () {
        expect(true).toBe(true);
    });
});