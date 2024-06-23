<template>
	<div>
		<div class="search">
			<el-input placeholder="请输入科室名称" style="width: 200px" v-model="searchkey"></el-input>
			<!-- <el-button type="info" plain style="margin-left: 10px" @click="loadDepartment(1)">查询</el-button> -->
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
			<el-button type="primary" plain @click="handleAddDepartment()">新增</el-button>
		</div>

		<div class="table">
			<el-table :data="departmentCompute" stripe @selection-change="handleSelectionChange">
				<el-table-column prop="id" label="序号" width="80" align="center" sortable></el-table-column>
				<el-table-column prop="departmentName" label="科室名称" show-overflow-tooltip></el-table-column>
				<el-table-column prop="description" label="科室描述" show-overflow-tooltip></el-table-column>

				<el-table-column label="操作" width="180" align="center">
					<template v-slot="scope">
						<el-button plain type="primary" @click="handleEditDepartment(scope.row)"
							size="mini">编辑</el-button>
						<el-button plain type="danger" size="mini"
							@click="deleteDepartment(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
			</div>
		</div>


		<el-dialog title="信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
			<el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
				<el-form-item prop="departmentName" label="科室名称">
					<el-input v-model="form.departmentName" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item prop="description" label="科室描述">
					<el-input type="textarea" :rows="5" v-model="form.description" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="fromVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveDepartment()">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	export default {
		name: "Department",
		data() {
			return {
				searchkey:'',
				tableData: [], // 所有的数据
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				name: null,
				fromVisible: false,
				form: {},
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				rules: {
					name: [{
						required: true,
						message: '请输入科室名称',
						trigger: 'blur'
					}, ],
				},
				ids: []
			}
		},
		mounted() {
		  this.fetchDepartment();
		},
		created() {
			this.loadDepartment(1)
		},
		computed: {
			departmentCompute: function() {
				return this.tableData.filter(item => {
					return item.departmentName.includes(this.searchkey)
				})
			}
		},
		methods: {
			fetchDepartment() {
				this.$request.get(`/api/v1/department/allDepartmentPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`).then(res => {
					console.log(res);
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			handleAddDepartment() { // 新增数据
				this.form = {} // 新增数据的时候清空数据
				this.fromVisible = true // 打开弹窗
			},
			handleEditDepartment(row) { // 编辑数据
				this.form = JSON.parse(JSON.stringify(row)) // 给form对象赋值 注意要深拷贝数据
				this.fromVisible = true // 打开弹窗
			},
			saveDepartment() { // 保存按钮触发的逻辑 它会触发新增或者更新
				// this.refs.formRef.validate((valid) => {
				// 	if (valid) {
						this.$request({
							url: this.form.id ? '/api/v1/department/updateDepartment' :
								'/api/v1/department/insertDepartment',
							method: 'POST',
							data: this.form
						}).then(res => {
							if (res.code == 200) { // 表示成功保存
								this.$message.success('保存成功')
								this.fetchDepartment()
								this.fromVisible = false
							} else {
								this.message.error(res.msg) // 弹出错误的信息
							}
						})
				// 	}
				// })
			},
			deleteDepartment(id) { // 单个删除
				this.confirm('您确定删除吗？', '确认删除', {
					type: "warning"
				}).then(response => {
					this.request.delete('/api/v1/doctor/deleteDoctorInfo/{id}' + id).then(res => {
						if (res.code === '200') { // 表示操作成功
							this.message.success('操作成功')
							this.loadDepartment(1)
						} else {
							this.message.error(res.msg) // 弹出错误的信息
						}
					})
				}).catch(() => {})
			},
			handleSelectionChange(rows) { // 当前选中的所有的行数据
				this.ids = rows.map(v => v.id) // [1,2]
			},
			loadDepartment(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/department/allDepartmentPager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			reset() {
				this.searchkey = ""
			},
			handleCurrentChange(pageNum) {
				this.loadDepartment(pageNum)
			},
		}
	}
</script>

<style scoped>

</style>