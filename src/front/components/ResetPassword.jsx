 export const ResetPassword = () => {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card p-4 shadow">
                            <h3>Restore your password</h3>
                            <form>
                                <div className="mb-3">
                                    <label for="exampleInputEmail1" class="form-label">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        class="form-control"
                                        id="exampleInputEmail1"
                                        aria-describedby="emailHelp"
                                    />
                                    
                                </div>
                                <div className="mb-3">
                                    <label for="exampleInputPassword1" class="form-label">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        class="form-control"
                                        id="exampleInputPassword1"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label for="exampleInputPassword1" class="form-label">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        class="form-control"
                                        id="exampleInputPassword1"
                                    />
                                </div>
                                <span className="Log-buttons d-flex ">
                                    <button type="submit" class="btn btn-danger">
                                        Restore
                                    </button>
                                    <button type="submit" class="btn btn-light">
                                        Cancel
                                    </button>
                                </span>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

